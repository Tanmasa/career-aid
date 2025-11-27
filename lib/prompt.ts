type SurveySummaryInput = {
  grade?: number | null;
  interests?: string | null;
  favoriteSubjects?: string | null;
  strengths?: string | null;
  concerns?: string | null;
  futurePlanning?: string | null;
  freeText?: string | null;
};

export type MessageLog = {
  role: 'user' | 'assistant';
  content: string;
};

const FUTURE_PLANNING_INSTRUCTIONS: Array<{ phrase: string; prompt: string }> = [
  {
    phrase: "実際に考えていてもう対策している",
    prompt: "回答者は既に具体的な対策を進めています。これまでの取り組みを認めた上で、より高度な視点や次の一歩を提案してください。"
  },
  {
    phrase: "考えてはいるが、少しづつ情報を集めている",
    prompt: "回答者は情報を集めている段階です。情報整理を手伝い、実践的なリサーチ方法や相談先を示してください。"
  },
  {
    phrase: "ぼんやり考えているが、何をすれば分からない",
    prompt: "回答者は進路の手がかりを探しています。選択肢や第一歩を噛み砕いて提案し、不安を解消できるよう支援してください。"
  },
  {
    phrase: "全く考えていない",
    prompt: "回答者はまだ進路を考え始めていません。プレッシャーをかけず、親しみやすく小さなきっかけや身近な興味から話を広げてください。"
  }
];

const getFuturePlanningInstruction = (surveySummary: string): string | null => {
  for (const entry of FUTURE_PLANNING_INSTRUCTIONS) {
    if (surveySummary.includes(entry.phrase)) {
      return entry.prompt;
    }
  }

  return null;
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

  if (input.futurePlanning) {
    chunks.push(`将来への考え: ${input.futurePlanning}`);
  }

  if (input.freeText) {
    chunks.push(`メモ: ${input.freeText}`);
  }

  return chunks.join(' / ') || 'アンケート情報なし';
};

export const buildInitialGreetingPrompt = (surveySummary: string): string => {
  const futurePlanningInstruction = getFuturePlanningInstruction(surveySummary);

  const parts = [
    'あなたは日本語で高校生の進路相談にやさしく答えるカウンセラーです。',
    `アンケート要約: ${surveySummary || '情報なし'}`
  ];

  if (futurePlanningInstruction) {
    parts.push(futurePlanningInstruction);
  }

  parts.push(
    '初回メッセージとして、アンケート内容に触れながら親しみやすく挨拶し、相談を促してください。',
    '200文字程度で簡潔にまとめてください。'
  );

  return parts.join('\n\n');
};
export const buildConversationPrompt = (
  surveySummary: string,
  userMessage: string
): string => {
  const futurePlanningInstruction = getFuturePlanningInstruction(surveySummary);

  const parts = [
    'あなたは日本語で高校生の進路相談にやさしく答えるカウンセラーです。',
    `アンケート要約: ${surveySummary || '情報なし'}`
  ];

  if (futurePlanningInstruction) {
    parts.push(futurePlanningInstruction);
  }

  parts.push(
    `ユーザーからの相談内容: ${userMessage}`,
    'アンケート内容を尊重しつつ、200文字程度で親身に回答してください。前後の会話は存在しない前提で最新の相談にのみ答えてください。'
  );

  return parts.join('\n\n');
};
