import { Test, TestingModule } from '@nestjs/testing';
import { SignatureFactoryService } from './signature-factory.service';
import { DocuSignProvider } from '../../infrastructure/providers/docusign.provider';
import { ClicksignProvider } from '../../infrastructure/providers/clicksign.provider';

describe('SignatureFactoryService', () => {
  let service: SignatureFactoryService;
  let docusignProvider: DocuSignProvider;
  let clicksignProvider: ClicksignProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignatureFactoryService,
        {
          provide: DocuSignProvider,
          useValue: { getName: () => 'docusign' },
        },
        {
          provide: ClicksignProvider,
          useValue: { getName: () => 'clicksign' },
        },
      ],
    }).compile();

    service = module.get<SignatureFactoryService>(SignatureFactoryService);
    docusignProvider = module.get<DocuSignProvider>(DocuSignProvider);
    clicksignProvider = module.get<ClicksignProvider>(ClicksignProvider);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return docusign provider', () => {
    const provider = service.getProvider('docusign');
    expect(provider.getName()).toBe('docusign');
  });

  it('should return clicksign provider', () => {
    const provider = service.getProvider('clicksign');
    expect(provider.getName()).toBe('clicksign');
  });

  it('should throw error for unknown provider', () => {
    expect(() => service.getProvider('unknown')).toThrowError("Signature provider 'unknown' not supported");
  });
});
