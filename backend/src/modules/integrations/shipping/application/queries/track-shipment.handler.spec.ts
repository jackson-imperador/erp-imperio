import { Test, TestingModule } from '@nestjs/testing';
import { TrackShipmentHandler } from './track-shipment.handler';
import { TrackShipmentQuery } from './track-shipment.query';
import { ShippingProviderFactory } from '../../infrastructure/factory/shipping-provider.factory';
import { CircuitBreakerService } from '../../../../../shared/infrastructure/resilience/circuit-breaker.service';
import { RetryService } from '../../../../../shared/infrastructure/resilience/retry.service';
import { ShippingProviderType } from '../../domain/enums/shipping-provider-type.enum';

describe('TrackShipmentHandler', () => {
  let handler: TrackShipmentHandler;
  let factory: jest.Mocked<ShippingProviderFactory>;
  let circuitBreaker: jest.Mocked<CircuitBreakerService>;
  let retryService: jest.Mocked<RetryService>;

  beforeEach(async () => {
    const mockProvider = {
      calculateFreight: jest.fn(),
      generateLabel: jest.fn(),
      trackShipment: jest.fn().mockResolvedValue({ status: 'DELIVERED' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrackShipmentHandler,
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

    handler = module.get<TrackShipmentHandler>(TrackShipmentHandler);
    factory = module.get(ShippingProviderFactory);
    circuitBreaker = module.get(CircuitBreakerService);
    retryService = module.get(RetryService);
  });

  it('should track shipment successfully', async () => {
    const query = new TrackShipmentQuery(ShippingProviderType.CORREIOS, 'BR123');
    const result = await handler.execute(query);

    expect(factory.getProvider).toHaveBeenCalledWith(ShippingProviderType.CORREIOS);
    expect(circuitBreaker.execute).toHaveBeenCalled();
    expect(retryService.execute).toHaveBeenCalled();
    expect(result.status).toBe('DELIVERED');
  });
});
