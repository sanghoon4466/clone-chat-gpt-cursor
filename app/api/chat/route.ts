import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { convertToModelMessages, streamText, UIMessage } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// v1beta API를 사용하는 Google provider 생성 (v1은 systemInstruction 미지원)
const googleProvider = createGoogleGenerativeAI({
  baseURL: 'https://generativelanguage.googleapis.com/v1beta',
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY,
});

export async function POST(req: Request) {
  try {
    // 환경 변수 검증 (두 가지 이름 모두 확인)
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'GOOGLE_GENERATIVE_AI_API_KEY or GEMINI_API_KEY is not set' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Request body에서 messages 추출
    const { messages }: { messages: UIMessage[] } = await req.json();

    // 에러 핸들링: messages가 없거나 배열이 아닌 경우
    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Messages must be an array' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // AI 모델 초기화 및 스트리밍 응답 생성
    const result = streamText({
      // v1beta API를 사용하는 provider 사용 (v1은 systemInstruction 미지원)
      model: googleProvider('gemini-2.5-flash'),
      system: 'You are a helpful assistant.',
      messages: convertToModelMessages(messages),
      temperature: 0.7,
    });

    // 스트리밍 응답 반환
    return result.toUIMessageStreamResponse();
  } catch (error) {
    // AI 모델 에러 처리
    console.error('Error in chat API:', error);
    return new Response(
      JSON.stringify({
        error: 'An error occurred while processing your request',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

