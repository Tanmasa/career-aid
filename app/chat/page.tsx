import { ChatClient, type ChatMessage } from './ChatClient';
import { buildInitialGreetingPrompt } from '@/lib/prompt';
import { getOrCreateSessionId } from '@/lib/session';
import { createServerSupabaseClient } from '@/lib/supabase';
import { callGemini } from '@/lib/gemini';

export default async function ChatPage() {
  const supabase = createServerSupabaseClient();
  const sessionId = getOrCreateSessionId();

  const { data: existingSession, error: sessionFetchError } = await supabase
    .from('sessions')
    .select('id, survey_summary')
    .eq('id', sessionId)
    .maybeSingle();

  if (sessionFetchError) {
    console.error(sessionFetchError);
    throw new Error('セッションの取得に失敗しました。');
  }

  if (!existingSession) {
    const { error: insertError } = await supabase.from('sessions').insert({ id: sessionId });

    if (insertError) {
      console.error(insertError);
      throw new Error('セッションの初期化に失敗しました。');
    }
  }

  const surveySummary = existingSession?.survey_summary ?? 'アンケート情報なし';

  const { data: messageLogs, error: messagesError } = await supabase
    .from('message_logs')
    .select('id, role, content, created_at')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (messagesError) {
    console.error(messagesError);
    throw new Error('メッセージの取得に失敗しました。');
  }

  let initialMessages: ChatMessage[] = messageLogs ?? [];

  if (initialMessages.length === 0) {
    try {
      const greetingPrompt = buildInitialGreetingPrompt(surveySummary);
      const greeting = await callGemini(greetingPrompt);

      const { error: greetingInsertError } = await supabase.from('message_logs').insert({
        session_id: sessionId,
        role: 'assistant',
        content: greeting
      });

      if (greetingInsertError) {
        console.error(greetingInsertError);
      } else {
        const { data: refreshedLogs, error: refreshedError } = await supabase
          .from('message_logs')
          .select('id, role, content, created_at')
          .eq('session_id', sessionId)
          .order('created_at', { ascending: true });

        if (refreshedError) {
          console.error(refreshedError);
        } else {
          initialMessages = refreshedLogs ?? [];
        }
      }
    } catch (error: unknown) {
      console.error('初期メッセージの生成に失敗しました。', error);
    }
  }

  return <ChatClient initialMessages={initialMessages} />;
}
