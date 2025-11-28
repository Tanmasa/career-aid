// app/api/chat/route.ts
import { NextResponse } from 'next/server';
import { callGemini } from '@/lib/gemini';
import { COACHING_PROMPTS, CoachingDomain } from '@/lib/coachingPrompt';
import { evaluateGoal } from '@/lib/goalEvaluator';
import { createServerSupabaseClient } from '@/lib/supabase';

export const runtime = 'nodejs';

// 次のドメイン遷移
const NEXT_DOMAIN: Record<string, string> = {
  'self-awareness': 'info',
  'info': 'goal',
  'goal': 'plan',
  'plan': 'problem',
  'problem': 'finished',
};

const DOMAIN_NAMES: Record<string, string> = {
  'self-awareness': '自己認識',
  'info': '情報収集',
  'goal': '目標選択',
  'plan': '計画作成',
  'problem': '問題解決',
  'finished': '完了',
};

export async function POST(req: Request) {
  try {
    const { message, mode, messages, turnCount } = await req.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: 'メッセージが空です。' }, { status: 400 });
    }

    // 1️⃣ 会話履歴作成
    const history = messages
      ? messages.map((m: any) => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`).join('\n')
      : '';

    // 2️⃣ ゴール判定用テキスト作成
    const userHistoryText = messages
      ? messages.filter((m: any) => m.role === 'user').map((m: any) => m.content).join(' ') + ' ' + message
      : message;

    // 3️⃣ ゴール評価
    const evaluation = evaluateGoal(mode, userHistoryText);

    // 4️⃣ プロンプト組み立て
    let systemInstruction = COACHING_PROMPTS[mode as CoachingDomain];

    // ストラグルロジック（5回以上かつ未達成）
    if (!evaluation.isGoalMet && turnCount >= 5) {
      systemInstruction += `
【システム通知: サポートモード】
ユーザーは既に5回以上やり取りしていますが、まだゴール条件（${evaluation.missingElements.join(
        ', '
      )}）に到達していません。
ユーザーが答えに詰まっているか、迷っている可能性があります。

**これまでの会話の文脈を踏まえて**、ゴールに近づくための「具体的な回答例」を2〜3個提示してください。
例：「例えば、先ほど部活の話が出ましたが、そこでの経験は強みになりませんか？」
例：「もし思いつかない場合は、〇〇という視点で考えてみるのはどうでしょう？」`;
    }

    let prompt = `
${systemInstruction}

【これまでの会話】
${history}

User: ${message}
`;

    // 5️⃣ ゴール達成時の追加指示
    if (evaluation.isGoalMet) {
      const nextMode = NEXT_DOMAIN[mode];
      const nextModeName = nextMode ? DOMAIN_NAMES[nextMode] || '次のステップ' : '次のステップ';

      prompt += `
【システム通知: ゴール達成】
ユーザーの発言により、このテーマ（${DOMAIN_NAMES[mode]}）のゴール条件が満たされました。
これ以上、このテーマについて質問を繰り返さないでください。

以下の手順で回答を作成してください：
1. **総評**: これまでの会話から、ユーザーの強みや考えを具体的に引用してまとめてください。
2. **称賛**: ユーザーの自己効力感を高めるために、その発見を褒めてください。
3. **次のステップへの誘導**: 「それでは、次は『${nextModeName}』について考えてみましょうか？」と提案してください。`;
    }

    // 6️⃣ Gemini 呼び出し
    let reply = '';
    try {
      reply = await callGemini(prompt);
    } catch (e: unknown) {
      console.error(e);
      return NextResponse.json({ error: 'Gemini API 呼び出しに失敗しました。' }, { status: 500 });
    }

    // 7️⃣ Supabase へログ保存
    const supabase = createServerSupabaseClient();
    const sessionId = crypto.randomUUID(); // 会話単位の ID

    const { error: insertError } = await supabase
      .from('message_logs')
      .insert([
        { session_id: sessionId, role: 'user', content: message },
        { session_id: sessionId, role: 'assistant', content: reply },
      ]);

    if (insertError) {
      console.error('Supabase insert error:', insertError);
    }

    // 8️⃣ 応答返却
    return NextResponse.json({ reply, evaluation });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'サーバーエラーが発生しました。' }, { status: 500 });
  }
}