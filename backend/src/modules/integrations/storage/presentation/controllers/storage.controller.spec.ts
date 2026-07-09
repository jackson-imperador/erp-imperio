import { Test, TestingModule } from '@nestjs/testing';
import { StorageController } from './storage.controller';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

describe('StorageController', () => {
  let controller: StorageController;
  let commandBus: jest.Mocked<CommandBus>;
  let queryBus: jest.Mocked<QueryBus>;

  beforeEach(async () => {
    commandBus = {
      execute: jest.fn(),
    } as any;

    queryBus = {
      execute: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StorageController],
      providers: [
        { provide: CommandBus, useValue: commandBus },
        { provide: QueryBus, useValue: queryBus },
      ],
    }).compile();

    controller = module.get<StorageController>(StorageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadFile', () => {
    it('should execute UploadFileCommand and GetFileUrlQuery', async () => {
      const file = {
        originalname: 'test.txt',
        mimetype: 'text/plain',
        buffer: Buffer.from('test'),
      } as any;

      queryBus.execute.mockResolvedValue('https://example.com/test.txt');

      const result = await controller.uploadFile(file);

      expect(commandBus.execute).toHaveBeenCalled();
      expect(queryBus.execute).toHaveBeenCalled();
      expect(result.url).toBe('https://example.com/test.txt');
      expect(result.filename).toContain('test.txt');
    });
  });

  describe('deleteFile', () => {
    it('should execute DeleteFileCommand', async () => {
      await controller.deleteFile('test.txt');
      expect(commandBus.execute).toHaveBeenCalled();
    });
  });

  describe('getFileUrl', () => {
    it('should execute GetFileUrlQuery', async () => {
      queryBus.execute.mockResolvedValue('https://example.com/test.txt');
      const result = await controller.getFileUrl('test.txt', '3600');
      
      expect(queryBus.execute).toHaveBeenCalled();
      expect(result.url).toBe('https://example.com/test.txt');
    });
  });
});
