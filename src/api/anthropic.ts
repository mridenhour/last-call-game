import { ANTHROPIC_API_KEY } from '@env';

const API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';
const API_VERSION = '2023-06-01';

export interface ApiMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ApiResponse {
  content: Array<{ type: string; text: string }>;
}

export class AnthropicError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'AnthropicError';
  }
}

export async function callAnthropic(
  messages: ApiMessage[],
  systemPrompt: string,
  maxTokens: number,
): Promise<string> {
  const key = ANTHROPIC_API_KEY;
  if (!key) throw new AnthropicError(401, 'ANTHROPIC_API_KEY not set in .env');

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'x-api-key': key,
      'anthropic-version': API_VERSION,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new AnthropicError(response.status, `API error ${response.status}: ${body}`);
  }

  const data: ApiResponse = await response.json();
  const text = data.content?.find(c => c.type === 'text')?.text ?? '';
  return text.trim();
}
