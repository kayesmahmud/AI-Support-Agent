import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Claude (Anthropic) client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
export const CLAUDE_MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResponse {
  message: string;
  provider: 'openai' | 'claude';
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * Try OpenAI first, fallback to Claude if it fails
 */
export async function generateChatResponse(
  messages: ChatMessage[],
  systemPrompt: string
): Promise<ChatResponse> {
  // Try OpenAI first
  try {
    console.log('🔵 Trying OpenAI...');
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
    console.log('❌ OpenAI failed:', (openaiError as Error).message);
    console.log('🟣 Falling back to Claude...');

    // Fallback to Claude
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
      console.log('❌ Claude also failed:', (claudeError as Error).message);
      throw new Error('Both OpenAI and Claude APIs failed. Please try again later.');
    }
  }
}

export default openai;
