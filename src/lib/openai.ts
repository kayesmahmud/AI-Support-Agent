import OpenAI from 'openai';

// Initialize DeepSeek client (OpenAI-compatible)
const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com',
});

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat';
export const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResponse {
  message: string;
  provider: 'deepseek' | 'openai';
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * Try DeepSeek first, then OpenAI as fallback
 */
export async function generateChatResponse(
  messages: ChatMessage[],
  systemPrompt: string
): Promise<ChatResponse> {
  // Try DeepSeek first (primary)
  try {
    console.log('🟢 Trying DeepSeek...');
    const response = await deepseek.chat.completions.create({
      model: DEEPSEEK_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const assistantMessage = response.choices[0]?.message?.content || '';

    console.log('✅ DeepSeek succeeded');
    return {
      message: assistantMessage,
      provider: 'deepseek',
      usage: response.usage
        ? {
            promptTokens: response.usage.prompt_tokens,
            completionTokens: response.usage.completion_tokens,
            totalTokens: response.usage.total_tokens,
          }
        : undefined,
    };
  } catch (deepseekError) {
    console.log('❌ DeepSeek failed:', (deepseekError as Error).message);
    console.log('🔵 Falling back to OpenAI...');

    // Fallback to OpenAI
    try {
      const response = await openai.chat.completions.create({
        model: OPENAI_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const assistantMessage = response.choices[0]?.message?.content || '';

      console.log('✅ OpenAI succeeded');
      return {
        message: assistantMessage,
        provider: 'openai',
        usage: response.usage
          ? {
              promptTokens: response.usage.prompt_tokens,
              completionTokens: response.usage.completion_tokens,
              totalTokens: response.usage.total_tokens,
            }
          : undefined,
      };
    } catch (openaiError) {
      console.log('❌ Both DeepSeek and OpenAI failed');
      throw new Error('Both AI providers (DeepSeek and OpenAI) failed. Please try again later.');
    }
  }
}

export default openai;
