import { GoogleGenerativeAI } from '@google/generative-ai';

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY が設定されていません (.env.local を確認してください)。');
  }
  return new GoogleGenerativeAI(apiKey);
};

export const callGemini = async (prompt: string): Promise<string> => {
  // Mock mode check (can be enabled via env var or specific flag if needed, 
  // but for now we'll stick to real calls unless in test environment)
  if (process.env.NODE_ENV === 'test' || process.env.USE_MOCK_GEMINI === 'true') {
    return mockGeminiResponse(prompt);
  }

  try {
    const genAI = getGeminiClient();
    // Switching to 'gemini-2.0-flash' as it is available in the user's environment.
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error('Gemini API Error Details:', JSON.stringify(error, null, 2));
    if (error.message) console.error('Error Message:', error.message);

    // Pass the actual error message for debugging
    throw new Error(`Gemini API 呼び出しに失敗しました: ${error.message || 'Unknown error'}`);
  }
};

export const mockGeminiResponse = (prompt: string): string => {
  console.log('Mock Gemini called with:', prompt);
  if (prompt.includes('自己認識')) {
    return 'あなたの強みは素晴らしいですね！具体的にはどんな場面で発揮しましたか？';
  }
  if (prompt.includes('職業情報')) {
    return 'なるほど。では、その職業について調べるために、まずは何から始めますか？';
  }
  return 'モック応答です。具体的な行動を教えてください。';
};
