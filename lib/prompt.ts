type SurveySummaryInput = {
  grade?: number | null;
  interests?: string | null;
  favoriteSubjects?: string | null;
  strengths?: string | null;
  concerns?: string | null;
  freeText?: string | null;
};

export type MessageLog = {
  role: 'user' | 'assistant';
  content: string;
};

export const summarizeSurvey = (input: SurveySummaryInput): string => {
  const chunks: string[] = [];

  if (typeof input.grade === 'number') {
    chunks.push(`学年: ${input.grade}年`);
  }

  if (input.strengths) {
    chunks.push(`得意: ${input.strengths}`);
  }

  if (input.interests) {
    chunks.push(`興味: ${input.interests}`);
  }

  if (input.favoriteSubjects) {
    chunks.push(`好きな科目: ${input.favoriteSubjects}`);
  }

  if (input.concerns) {
    chunks.push(`不安: ${input.concerns}`);
  }

  if (input.freeText) {
    chunks.push(`メモ: ${input.freeText}`);
  }

  return chunks.join(' / ') || 'アンケート情報なし';
};

export const buildInitialGreetingPrompt = (surveySummary: string): string => {
  return [
    'あなたは日本語で高校生の進路相談にやさしく答えるカウンセラーです。',
    `アンケート要約: ${surveySummary || '情報なし'}`,
    '初回メッセージとして、アンケート内容に触れながら親しみやすく挨拶し、相談を促してください。',
    '200文字程度で簡潔にまとめてください。'
  ].join('\n\n');
};

export const buildConversationPrompt = (
  surveySummary: string,
  history: MessageLog[],
  userMessage: string
): string => {
  const historyText = history
    .map((entry) => `${entry.role === 'assistant' ? 'AI' : 'ユーザー'}: ${entry.content}`)
    .join('\n');

  return [
    'あなたは日本語で高校生の進路相談にやさしく答えるカウンセラーです。',
    `アンケート要約: ${surveySummary || '情報なし'}`,
    historyText ? `これまでの会話:\n${historyText}` : 'これまでの会話: なし',
    `最新のユーザー入力: ${userMessage}`,
    'アンケート内容を尊重しつつ、200文字程度で親身に回答してください。'
  ].join('\n\n');
};
