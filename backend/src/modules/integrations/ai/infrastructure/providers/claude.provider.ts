import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { IAiProvider, AiChatPayload, AiChatResult } from '../../domain/interfaces/ai-provider.interface';

@Injectable()
export class ClaudeProvider implements IAiProvider {
  private readonly logger = new Logger(ClaudeProvider.name);
  private readonly apiKey: string;
  private readonly apiUrl = 'https://api.anthropic.com/v1/messages';

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.apiKey = this.configService.get<string>('ANTHROPIC_API_KEY') || 'dummy';
  }

  getName(): string {
    return 'claude';
  }

  private get headers() {
    return {
      'x-api-key': this.apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    };
  }

  async chat(payload: AiChatPayload): Promise<AiChatResult> {
    const data: any = {
      model: 'claude-3-5-sonnet-20240620',
      messages: [
        { role: 'user', content: payload.prompt }
      ],
      max_tokens: payload.maxTokens || 1024,
      temperature: payload.temperature,
    };

    if (payload.systemPrompt) {
      data.system = payload.systemPrompt;
    }

    const response = await lastValueFrom(
      this.httpService.post(this.apiUrl, data, { headers: this.headers }),
    );

    return {
      text: response.data.content[0].text,
      provider: this.getName(),
      model: 'claude-3-5-sonnet',
    };
  }

  async completion(payload: AiChatPayload): Promise<AiChatResult> {
    return this.chat(payload);
  }

  async embeddings(text: string): Promise<number[]> {
    // Anthropic does not have a native embeddings API right now, we can throw or mock
    this.logger.warn('Anthropic does not support embeddings natively.');
    return [];
  }

  async summarize(text: string): Promise<AiChatResult> {
    return this.chat({ prompt: `Summarize this text: ${text}` });
  }

  async classify(text: string, categories: string[]): Promise<AiChatResult> {
    return this.chat({ prompt: `Classify the following text into one of these categories: ${categories.join(', ')}.\nText: ${text}` });
  }

  async extract(text: string, schema: any): Promise<AiChatResult> {
    return this.chat({
      systemPrompt: `Extract information matching this JSON schema: ${JSON.stringify(schema)}. Respond ONLY in JSON.`,
      prompt: text,
    });
  }

  async translate(text: string, targetLanguage: string): Promise<AiChatResult> {
    return this.chat({ prompt: `Translate the following text to ${targetLanguage}:\n${text}` });
  }
}
