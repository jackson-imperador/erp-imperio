export interface AiChatPayload {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
  stream?: boolean;
}

export interface AiChatResult {
  text: string;
  provider: string;
  model: string;
}

export interface IAiProvider {
  getName(): string;
  chat(payload: AiChatPayload): Promise<AiChatResult>;
  completion(payload: AiChatPayload): Promise<AiChatResult>;
  embeddings(text: string): Promise<number[]>;
  summarize(text: string): Promise<AiChatResult>;
  classify(text: string, categories: string[]): Promise<AiChatResult>;
  extract(text: string, schema: any): Promise<AiChatResult>;
  translate(text: string, targetLanguage: string): Promise<AiChatResult>;
}
