import { Test, TestingModule } from '@nestjs/testing';
import { GenerateShippingLabelHandler } from './generate-shipping-label.handler';
import { GenerateShippingLabelCommand } from './generate-shipping-label.command';
import { ShippingProviderFactory } from '../../infrastructure/factory/shipping-provider.factory';
import { CircuitBreakerService } from '../../../../../shared/infrastructure/resilience/circuit-breaker.service';
import { RetryService } from '../../../../../shared/infrastructure/resilience/retry.service';
import { ShippingProviderType } from '../../domain/enums/shipping-provider-type.enum';

describe('GenerateShippingLabelHandler', () => {
  let handler: GenerateShippingLabelHandler;
  let factory: jest.Mocked<ShippingProviderFactory>;
  let circuitBreaker: jest.Mocked<CircuitBreakerService>;
  let retryService: jest.Mocked<RetryService>;

  beforeEach(async () => {
    const mockProvider = {
      calculateFreight: jest.fn(),
      generateLabel: jest.fn().mockResolvedValue({ trackingCode: 'BR123' }),
      trackShipment: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenerateShippingLabelHandler,
        {
          provide: ShippingProviderFactory,
          useValue: {
            getProvider: jest.fn().mockReturnValue(mockProvider),
          },
        },
        {
          provide: CircuitBreakerService,
          useValue: {
            execute: jest.fn().mockImplementation((cb) => cb()),
          },
        },
        {
          provide: RetryService,
          useValue: {
            execute: jest.fn().mockImplementation((cb) => cb()),
          },
        },
      ],
    }).compile();

    handler = module.get<GenerateShippingLabelHandler>(GenerateShippingLabelHandler);
    factory = module.get(ShippingProviderFactory);
    circuitBreaker = module.get(CircuitBreakerService);
    retryService = module.get(RetryService);
  });

  it('should generate shipping label successfully', async () => {
    const command = new GenerateShippingLabelCommand(ShippingProviderType.CORREIOS, 'ORDER1', 'SEDEX', 'John Doe');
    const result = await handler.execute(command);

    expect(factory.getProvider).toHaveBeenCalledWith(ShippingProviderType.CORREIOS);
    expect(circuitBreaker.execute).toHaveBeenCalled();
    expect(retryService.execute).toHaveBeenCalled();
    expect(result.trackingCode).toBe('BR123');
  });
});
