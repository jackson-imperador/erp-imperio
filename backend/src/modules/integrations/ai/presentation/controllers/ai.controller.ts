import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AiFactoryService } from '../../application/services/ai-factory.service';
import {
  ChatRequestDto,
  EmbeddingsRequestDto,
  ClassifyRequestDto,
  ExtractRequestDto,
  TranslateRequestDto,
} from '../../domain/dtos/ai-requests.dto';

@ApiTags('AI Integrations')
@Controller('integrations/ai')
export class AiIntegrationController {
  constructor(private readonly aiFactory: AiFactoryService) {}

  @Post('chat')
  @ApiOperation({ summary: 'Send a chat message to an AI provider' })
  @ApiResponse({ status: 200, description: 'Chat response' })
  async chat(@Body() dto: ChatRequestDto) {
    const provider = this.aiFactory.getProvider(dto.provider);
    return this.aiFactory.executeWithResilience(
      'chat',
      () => provider.chat(dto),
      // Example of fallback to openai if fails
      dto.provider !== 'openai' ? () => this.aiFactory.getProvider('openai').chat(dto) : undefined
    );
  }

  @Post('completion')
  @ApiOperation({ summary: 'Get a completion from an AI provider' })
  async completion(@Body() dto: ChatRequestDto) {
    const provider = this.aiFactory.getProvider(dto.provider);
    return this.aiFactory.executeWithResilience(
      'completion',
      () => provider.completion(dto),
      dto.provider !== 'openai' ? () => this.aiFactory.getProvider('openai').completion(dto) : undefined
    );
  }

  @Post('embeddings')
  @ApiOperation({ summary: 'Generate embeddings for text' })
  async embeddings(@Body() dto: EmbeddingsRequestDto) {
    const provider = this.aiFactory.getProvider(dto.provider);
    return this.aiFactory.executeWithResilience(
      'embeddings',
      () => provider.embeddings(dto.text),
      dto.provider !== 'openai' ? () => this.aiFactory.getProvider('openai').embeddings(dto.text) : undefined
    );
  }

  @Post('summarize')
  @ApiOperation({ summary: 'Summarize text' })
  async summarize(@Body() dto: ChatRequestDto) {
    const provider = this.aiFactory.getProvider(dto.provider);
    return this.aiFactory.executeWithResilience(
      'summarize',
      () => provider.summarize(dto.prompt),
      dto.provider !== 'openai' ? () => this.aiFactory.getProvider('openai').summarize(dto.prompt) : undefined
    );
  }

  @Post('classify')
  @ApiOperation({ summary: 'Classify text into categories' })
  async classify(@Body() dto: ClassifyRequestDto) {
    const provider = this.aiFactory.getProvider(dto.provider);
    return this.aiFactory.executeWithResilience(
      'classify',
      () => provider.classify(dto.text, dto.categories),
      dto.provider !== 'openai' ? () => this.aiFactory.getProvider('openai').classify(dto.text, dto.categories) : undefined
    );
  }

  @Post('extract')
  @ApiOperation({ summary: 'Extract structured data from text' })
  async extract(@Body() dto: ExtractRequestDto) {
    const provider = this.aiFactory.getProvider(dto.provider);
    return this.aiFactory.executeWithResilience(
      'extract',
      () => provider.extract(dto.text, dto.schema),
      dto.provider !== 'openai' ? () => this.aiFactory.getProvider('openai').extract(dto.text, dto.schema) : undefined
    );
  }

  @Post('translate')
  @ApiOperation({ summary: 'Translate text' })
  async translate(@Body() dto: TranslateRequestDto) {
    const provider = this.aiFactory.getProvider(dto.provider);
    return this.aiFactory.executeWithResilience(
      'translate',
      () => provider.translate(dto.text, dto.targetLanguage),
      dto.provider !== 'openai' ? () => this.aiFactory.getProvider('openai').translate(dto.text, dto.targetLanguage) : undefined
    );
  }
}
