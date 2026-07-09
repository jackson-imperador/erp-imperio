import { Test, TestingModule } from '@nestjs/testing';
import { CalculateFreightHandler } from './calculate-freight.handler';
import { CalculateFreightQuery } from './calculate-freight.query';
import { ShippingProviderFactory } from '../../infrastructure/factory/shipping-provider.factory';
import { CircuitBreakerService } from '../../../../../shared/infrastructure/resilience/circuit-breaker.service';
import { RetryService } from '../../../../../shared/infrastructure/resilience/retry.service';
import { ShippingProviderType } from '../../domain/enums/shipping-provider-type.enum';

describe('CalculateFreightHandler', () => {
  let handler: CalculateFreightHandler;
  let factory: jest.Mocked<ShippingProviderFactory>;
  let circuitBreaker: jest.Mocked<CircuitBreakerService>;
  let retryService: jest.Mocked<RetryService>;

  beforeEach(async () => {
    const mockProvider = {
      calculateFreight: jest.fn().mockResolvedValue({ price: 20 }),
      generateLabel: jest.fn(),
      trackShipment: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CalculateFreightHandler,
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

    handler = module.get<CalculateFreightHandler>(CalculateFreightHandler);
    factory = module.get(ShippingProviderFactory);
    circuitBreaker = module.get(CircuitBreakerService);
    retryService = module.get(RetryService);
  });

  it('should calculate freight successfully', async () => {
    const query = new CalculateFreightQuery(ShippingProviderType.CORREIOS, '12345000', '54321000', 1);
    const result = await handler.execute(query);

    expect(factory.getProvider).toHaveBeenCalledWith(ShippingProviderType.CORREIOS);
    expect(circuitBreaker.execute).toHaveBeenCalled();
    expect(retryService.execute).toHaveBeenCalled();
    expect(result.price).toBe(20);
  });
});
