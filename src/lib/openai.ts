import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

// Initialize DeepSeek client (OpenAI-compatible)
const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com',
});

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Claude (Anthropic) client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat';
export const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
export const CLAUDE_MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResponse {
  message: string;
  provider: 'deepseek' | 'openai' | 'claude';
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * Try DeepSeek first, then OpenAI, then Claude as fallbacks
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
      console.log('❌ OpenAI also failed:', (openaiError as Error).message);
      console.log('🟣 Falling back to Claude...');

      // Final fallback to Claude
      try {
        const response = await anthropic.messages.create({
          model: CLAUDE_MODEL,
          max_tokens: 1000,
          system: systemPrompt,
          messages: messages.map(msg => ({
            role: msg.role === 'system' ? 'user' : msg.role,
            content: msg.content,
          })),
        });

        const assistantMessage = response.content[0].type === 'text'
          ? response.content[0].text
          : '';

        console.log('✅ Claude succeeded');
        return {
          message: assistantMessage,
          provider: 'claude',
          usage: {
            promptTokens: response.usage.input_tokens,
            completionTokens: response.usage.output_tokens,
            totalTokens: response.usage.input_tokens + response.usage.output_tokens,
          },
        };
      } catch (claudeError) {
        console.log('❌ All APIs failed');
        throw new Error('All AI providers (DeepSeek, OpenAI, Claude) failed. Please try again later.');
      }
    }
  }
}

export default openai;
