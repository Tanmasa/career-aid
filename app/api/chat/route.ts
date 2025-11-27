import { NextResponse } from 'next/server';
import { callGemini } from '@/lib/gemini';
import { COACHING_PROMPTS, CoachingDomain } from '@/lib/coachingPrompt';
import { evaluateGoal } from '@/lib/goalEvaluator';

export const runtime = 'nodejs';

// Define next domain mapping
const NEXT_DOMAIN: Record<string, string> = {
  'self-awareness': 'info',
  'info': 'goal',
  'goal': 'plan',
  'plan': 'problem',
  'problem': 'finished'
};

const DOMAIN_NAMES: Record<string, string> = {
  'self-awareness': '自己認識',
  'info': '情報収集',
  'goal': '目標選択',
  'plan': '計画作成',
  'problem': '問題解決',
  'finished': '完了'
};

export async function POST(req: Request) {
  try {
    const { message, mode, messages, turnCount } = await req.json();

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'メッセージが空です。' }, { status: 400 });
    }

    // 1. Build conversation history for context
    const history = messages ? messages.map((m: any) => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`).join('\n') : '';

    // 2. Accumulate user text for goal evaluation
    const userHistoryText = messages
      ? messages.filter((m: any) => m.role === 'user').map((m: any) => m.content).join(' ') + ' ' + message
      : message;

    // 3. Evaluate if the goal is met using the accumulated text
    const evaluation = evaluateGoal(mode, userHistoryText);

    // 4. Build prompt
    let systemInstruction = COACHING_PROMPTS[mode as CoachingDomain];

    // Fallback Logic: If user is struggling (turnCount >= 5) and goal not met
    if (!evaluation.isGoalMet && turnCount >= 5) {
      systemInstruction += `
\n\n【システム通知: サポートモード】
ユーザーは既に5回以上やり取りしていますが、まだゴール条件（${evaluation.missingElements.join(', ')}）に到達していません。
ユーザーが答えに詰まっているか、迷っている可能性があります。

**これまでの会話の文脈を踏まえて**、ゴールに近づくための「具体的な回答例」を2〜3個提示してください。
例：「例えば、先ほど部活の話が出ましたが、そこでの経験は強みになりませんか？」
例：「もし思いつかない場合は、〇〇という視点で考えてみるのはどうでしょう？」

質問を繰り返すのではなく、ユーザーが「それなら言える！」と思えるような助け舟を出してください。
`;
    }

    let prompt = `
${systemInstruction}

【これまでの会話】
${history}

User: ${message}
`;

    // 5. If goal is met, inject specific instruction to summarize and move on
    if (evaluation.isGoalMet) {
      const nextMode = NEXT_DOMAIN[mode];
      const nextModeName = DOMAIN_NAMES[nextMode] || '次のステップ';

      prompt += `
\n\n【システム通知: ゴール達成】
ユーザーの発言により、このテーマ（${DOMAIN_NAMES[mode]}）のゴール条件が満たされました。
これ以上、このテーマについて質問を繰り返さないでください。

以下の手順で回答を作成してください：
1. **総評**: これまでの会話から、ユーザーの強みや考えを具体的に引用してまとめてください。（例：「〜というお話から、〜という強みがあると感じました。素晴らしいですね！」）
2. **称賛**: ユーザーの自己効力感を高めるために、その発見を褒めてください。
3. **次のステップへの誘導**: 「それでは、次は『${nextModeName}』について考えてみましょうか？」と、次のテーマへ進むことを提案してください。
`;
    }

    let reply = '';
    try {
      reply = await callGemini(prompt);
    } catch (error: unknown) {
      console.error(error);
      return NextResponse.json({ error: 'Gemini API 呼び出しに失敗しました。' }, { status: 500 });
    }

    return NextResponse.json({ reply, evaluation });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'サーバーエラーが発生しました。' }, { status: 500 });
  }
}
