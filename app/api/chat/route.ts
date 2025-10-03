import { NextResponse } from 'next/server';

import { buildConversationPrompt } from '@/lib/prompt';
import { getOrCreateSessionId } from '@/lib/session';
import { createServerSupabaseClient } from '@/lib/supabase';
import { callGemini } from '@/lib/gemini';

export const runtime = 'nodejs';

export const POST = async (request: Request) => {
  const supabase = createServerSupabaseClient();
  const sessionId = getOrCreateSessionId();

  const { message } = (await request.json()) as { message?: string };

  if (!message || !message.trim()) {
    return NextResponse.json({ error: 'メッセージが空です。' }, { status: 400 });
  }

  const sanitizedMessage = message.trim();

  const { data: existingSession } = await supabase
    .from('sessions')
    .select('id, survey_summary')
    .eq('id', sessionId)
    .maybeSingle();

  if (!existingSession) {
    const { error: insertSessionError } = await supabase
      .from('sessions')
      .insert({ id: sessionId, consent: false });

    if (insertSessionError) {
      console.error(insertSessionError);
      return NextResponse.json({ error: 'セッションの初期化に失敗しました。' }, { status: 500 });
    }
  }

  const surveySummary = existingSession?.survey_summary ?? 'アンケート情報なし';

  const { data: historyData, error: historyError } = await supabase
    .from('message_logs')
    .select('role, content')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })
    .limit(20);

  if (historyError) {
    console.error(historyError);
    return NextResponse.json({ error: '履歴の取得に失敗しました。' }, { status: 500 });
  }

  const { error: userInsertError } = await supabase.from('message_logs').insert({
    session_id: sessionId,
    role: 'user',
    content: sanitizedMessage
  });

  if (userInsertError) {
    console.error(userInsertError);
    return NextResponse.json({ error: 'メッセージの保存に失敗しました。' }, { status: 500 });
  }

  const prompt = buildConversationPrompt(surveySummary, historyData ?? [], sanitizedMessage);

  let reply: string;

  try {
    reply = await callGemini(prompt);
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json({ error: 'Gemini API 呼び出しに失敗しました。' }, { status: 500 });
  }

  const { error: assistantInsertError } = await supabase.from('message_logs').insert({
    session_id: sessionId,
    role: 'assistant',
    content: reply
  });

  if (assistantInsertError) {
    console.error(assistantInsertError);
    return NextResponse.json({ error: '応答の保存に失敗しました。' }, { status: 500 });
  }

  return NextResponse.json({ reply });
};
