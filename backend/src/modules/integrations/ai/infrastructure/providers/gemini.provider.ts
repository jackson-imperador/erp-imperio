import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { IAiProvider, AiChatPayload, AiChatResult } from '../../domain/interfaces/ai-provider.interface';

@Injectable()
export class GeminiProvider implements IAiProvider {
  private readonly logger = new Logger(GeminiProvider.name);
  private readonly apiKey: string;
  private readonly apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models';

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.apiKey = this.configService.get<string>('GEMINI_API_KEY') || 'dummy';
  }

  getName(): string {
    return 'gemini';
  }

  async chat(payload: AiChatPayload): Promise<AiChatResult> {
    const url = `${this.apiUrl}/gemini-1.5-pro:generateContent?key=${this.apiKey}`;
    const contents = [];
    
    let textStr = payload.prompt;
    if (payload.systemPrompt) {
      textStr = `System: ${payload.systemPrompt}\nUser: ${payload.prompt}`;
    }

    const response = await lastValueFrom(
      this.httpService.post(url, {
        contents: [
          {
            parts: [{ text: textStr }]
          }
        ],
        generationConfig: {
          maxOutputTokens: payload.maxTokens,
          temperature: payload.temperature,
        }
      }),
    );

    const generatedText = response.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    return {
      text: generatedText,
      provider: this.getName(),
      model: 'gemini-1.5-pro',
    };
  }

  async completion(payload: AiChatPayload): Promise<AiChatResult> {
    return this.chat(payload);
  }

  async embeddings(text: string): Promise<number[]> {
    const url = `${this.apiUrl}/text-embedding-004:embedContent?key=${this.apiKey}`;
    const response = await lastValueFrom(
      this.httpService.post(url, {
        model: 'models/text-embedding-004',
        content: {
          parts: [{ text }]
        }
      }),
    );
    return response.data.embedding.values;
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
