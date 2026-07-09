import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { IAiProvider, AiChatPayload, AiChatResult } from '../../domain/interfaces/ai-provider.interface';

@Injectable()
export class OpenAiProvider implements IAiProvider {
  private readonly logger = new Logger(OpenAiProvider.name);
  private readonly apiKey: string;
  private readonly apiUrl = 'https://api.openai.com/v1';

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.apiKey = this.configService.get<string>('OPENAI_API_KEY') || 'dummy';
  }

  getName(): string {
    return 'openai';
  }

  private get headers() {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  async chat(payload: AiChatPayload): Promise<AiChatResult> {
    const messages = [];
    if (payload.systemPrompt) {
      messages.push({ role: 'system', content: payload.systemPrompt });
    }
    messages.push({ role: 'user', content: payload.prompt });

    const response = await lastValueFrom(
      this.httpService.post(
        `${this.apiUrl}/chat/completions`,
        {
          model: 'gpt-4o',
          messages,
          max_tokens: payload.maxTokens,
          temperature: payload.temperature,
          stream: payload.stream || false,
        },
        { headers: this.headers },
      ),
    );

    return {
      text: response.data.choices[0].message.content,
      provider: this.getName(),
      model: response.data.model,
    };
  }

  async completion(payload: AiChatPayload): Promise<AiChatResult> {
    return this.chat(payload); // Usually mapping to chat since completions is legacy
  }

  async embeddings(text: string): Promise<number[]> {
    const response = await lastValueFrom(
      this.httpService.post(
        `${this.apiUrl}/embeddings`,
        {
          model: 'text-embedding-3-small',
          input: text,
        },
        { headers: this.headers },
      ),
    );
    return response.data.data[0].embedding;
  }

  async summarize(text: string): Promise<AiChatResult> {
    return this.chat({ prompt: `Summarize this: ${text}` });
  }

  async classify(text: string, categories: string[]): Promise<AiChatResult> {
    return this.chat({ prompt: `Classify the following text into one of these categories: ${categories.join(', ')}.\nText: ${text}` });
  }

  async extract(text: string, schema: any): Promise<AiChatResult> {
    return this.chat({
      systemPrompt: `Extract information matching this schema: ${JSON.stringify(schema)}. Respond ONLY in JSON.`,
      prompt: text,
    });
  }

  async translate(text: string, targetLanguage: string): Promise<AiChatResult> {
    return this.chat({ prompt: `Translate the following to ${targetLanguage}:\n${text}` });
  }
}
