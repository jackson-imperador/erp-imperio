import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsBoolean, IsArray, IsObject } from 'class-validator';

export class ChatRequestDto {
  @ApiProperty({ description: 'The prompt to send to the AI', example: 'Hello, world!' })
  @IsString()
  prompt: string;

  @ApiPropertyOptional({ description: 'The system prompt to send to the AI', example: 'You are a helpful assistant.' })
  @IsOptional()
  @IsString()
  systemPrompt?: string;

  @ApiPropertyOptional({ description: 'Maximum tokens for the response', example: 100 })
  @IsOptional()
  @IsNumber()
  maxTokens?: number;

  @ApiPropertyOptional({ description: 'Temperature for generation', example: 0.7 })
  @IsOptional()
  @IsNumber()
  temperature?: number;

  @ApiPropertyOptional({ description: 'Whether to stream the response', example: false })
  @IsOptional()
  @IsBoolean()
  stream?: boolean;

  @ApiPropertyOptional({ description: 'The provider to use', example: 'openai' })
  @IsOptional()
  @IsString()
  provider?: string;
}

export class EmbeddingsRequestDto {
  @ApiProperty({ description: 'Text to generate embeddings for' })
  @IsString()
  text: string;

  @ApiPropertyOptional({ description: 'The provider to use', example: 'openai' })
  @IsOptional()
  @IsString()
  provider?: string;
}

export class ClassifyRequestDto {
  @ApiProperty({ description: 'Text to classify' })
  @IsString()
  text: string;

  @ApiProperty({ description: 'Categories to classify into', type: [String] })
  @IsArray()
  categories: string[];

  @ApiPropertyOptional({ description: 'The provider to use', example: 'openai' })
  @IsOptional()
  @IsString()
  provider?: string;
}

export class ExtractRequestDto {
  @ApiProperty({ description: 'Text to extract data from' })
  @IsString()
  text: string;

  @ApiProperty({ description: 'JSON Schema to extract', type: Object })
  @IsObject()
  schema: any;

  @ApiPropertyOptional({ description: 'The provider to use', example: 'openai' })
  @IsOptional()
  @IsString()
  provider?: string;
}

export class TranslateRequestDto {
  @ApiProperty({ description: 'Text to translate' })
  @IsString()
  text: string;

  @ApiProperty({ description: 'Target language code' })
  @IsString()
  targetLanguage: string;

  @ApiPropertyOptional({ description: 'The provider to use', example: 'openai' })
  @IsOptional()
  @IsString()
  provider?: string;
}
