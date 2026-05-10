import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export type Message = {
  id: string;
  role: 'user' | 'model';
  text: string;
  isStreaming?: boolean;
  isError?: boolean;
};

export async function* streamMessage(history: Message[], prompt: string) {
  // Filter history to ensure it meets API expectations
  const formattedHistory = history.filter(m => !m.isError && m.text).map(m => ({
    role: m.role,
    parts: [{ text: m.text }]
  }));

  const contents = [
    ...formattedHistory,
    {
      role: 'user',
      parts: [{ text: prompt }]
    }
  ];

  try {
    const response = await ai.models.generateContentStream({
      model: 'gemini-3.1-pro-preview',
      contents: contents as any,
    });

    for await (const chunk of response) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}
