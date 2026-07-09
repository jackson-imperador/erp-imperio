import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IShippingProvider, FreightResult, ShippingLabelResult, TrackingResult } from '../../domain/interfaces/shipping-provider.interface';
import { CalculateFreightDto, GenerateShippingLabelDto, TrackShipmentDto } from '../../domain/dtos/shipping.dto';

@Injectable()
export class FrenetProvider implements IShippingProvider {
  private readonly logger = new Logger(FrenetProvider.name);
  private readonly apiUrl: string;
  private readonly token: string;

  constructor(private readonly configService: ConfigService) {
    this.apiUrl = this.configService.get<string>('FRENET_API_URL', 'https://api.frenet.com.br/shipping');
    this.token = this.configService.get<string>('FRENET_TOKEN', 'token');
  }

  async calculateFreight(data: CalculateFreightDto): Promise<FreightResult> {
    this.logger.log(`Calculating Frenet freight for ${data.destinationZipCode}`);
    const response = await fetch(`${this.apiUrl}/quote`, {
      method: 'POST',
      headers: { token: this.token, 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Frenet API error');
    return {
      price: 18.00,
      estimatedDeliveryDays: 3,
      serviceName: 'Frenet Standard',
    };
  }

  async generateLabel(data: GenerateShippingLabelDto): Promise<ShippingLabelResult> {
    this.logger.log(`Generating Frenet label for order ${data.orderId}`);
    return {
      trackingCode: 'FR123456789',
      labelUrl: 'https://frenet.com.br/label/123.pdf',
    };
  }

  async trackShipment(data: TrackShipmentDto): Promise<TrackingResult> {
    this.logger.log(`Tracking Frenet shipment ${data.trackingCode}`);
    return {
      status: 'IN_TRANSIT',
      lastUpdate: new Date(),
      events: [],
    };
  }
}
