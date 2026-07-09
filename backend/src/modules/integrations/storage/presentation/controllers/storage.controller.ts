import { Controller, Post, Get, Delete, Param, Query, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadFileCommand } from '../../application/commands/upload-file.command';
import { DeleteFileCommand } from '../../application/commands/delete-file.command';
import { GetFileUrlQuery } from '../../application/queries/get-file-url.query';
import { UploadFileDto } from '../../domain/dtos/upload-file.dto';

@ApiTags('Storage Integration')
@Controller('integrations/storage')
export class StorageController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload a file to the storage provider' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadFileDto })
  @ApiResponse({ status: 201, description: 'File uploaded successfully', schema: { properties: { url: { type: 'string' } } } })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const filename = `${Date.now()}-${file.originalname}`;
    await this.commandBus.execute(new UploadFileCommand(filename, file.mimetype, file.buffer));
    
    // Get URL immediately after upload
    const url = await this.queryBus.execute(new GetFileUrlQuery(filename));
    return { url, filename };
  }

  @Delete(':filename')
  @ApiOperation({ summary: 'Delete a file from the storage provider' })
  @ApiParam({ name: 'filename', type: 'string' })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  async deleteFile(@Param('filename') filename: string) {
    await this.commandBus.execute(new DeleteFileCommand(filename));
    return { message: 'File deleted successfully' };
  }

  @Get(':filename/url')
  @ApiOperation({ summary: 'Get a signed URL for a file' })
  @ApiParam({ name: 'filename', type: 'string' })
  @ApiQuery({ name: 'expiresIn', type: 'number', required: false, description: 'Expiration time in seconds (default: 3600)' })
  @ApiResponse({ status: 200, description: 'URL generated successfully', schema: { properties: { url: { type: 'string' } } } })
  async getFileUrl(@Param('filename') filename: string, @Query('expiresIn') expiresIn?: string) {
    const expires = expiresIn ? parseInt(expiresIn, 10) : 3600;
    const url = await this.queryBus.execute(new GetFileUrlQuery(filename, expires));
    return { url };
  }
}
