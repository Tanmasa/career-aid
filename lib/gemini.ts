const getGeminiConfig = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY が設定されていません (.env.local を確認してください)。');
  }

  const model = process.env.GEMINI_MODEL ?? 'gemini-1.5-flash-latest';
  const apiVersion = process.env.GEMINI_API_VERSION ?? 'v1';
  const endpoint = `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent`;

  return { apiKey, endpoint };
};

export const callGemini = async (prompt: string): Promise<string> => {
  const { apiKey, endpoint } = getGeminiConfig();

  const response = await fetch(`${endpoint}?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ]
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini API error: ${errorBody}`);
  }

  const payload = (await response.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{ text?: string }>;
      };
    }>;
  };

  return (
    payload.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
    '申し訳ありません。うまく応答を生成できませんでした。'
  );
};
