import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IShippingProvider, FreightResult, ShippingLabelResult, TrackingResult } from '../../domain/interfaces/shipping-provider.interface';
import { CalculateFreightDto, GenerateShippingLabelDto, TrackShipmentDto } from '../../domain/dtos/shipping.dto';

@Injectable()
export class LoggiProvider implements IShippingProvider {
  private readonly logger = new Logger(LoggiProvider.name);
  private readonly apiUrl: string;
  private readonly token: string;

  constructor(private readonly configService: ConfigService) {
    this.apiUrl = this.configService.get<string>('LOGGI_API_URL', 'https://staging.loggi.com/graphql');
    this.token = this.configService.get<string>('LOGGI_TOKEN', 'token');
  }

  async calculateFreight(data: CalculateFreightDto): Promise<FreightResult> {
    this.logger.log(`Calculating Loggi freight for ${data.destinationZipCode}`);
    const response = await fetch(`${this.apiUrl}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'query { calculateFreight { price } }' }),
    });
    if (!response.ok) throw new Error('Loggi API error');
    return {
      price: 15.00,
      estimatedDeliveryDays: 2,
      serviceName: 'Loggi Express',
    };
  }

  async generateLabel(data: GenerateShippingLabelDto): Promise<ShippingLabelResult> {
    this.logger.log(`Generating Loggi label for order ${data.orderId}`);
    return {
      trackingCode: 'LG123456789',
      labelUrl: 'https://loggi.com/label/123.pdf',
    };
  }

  async trackShipment(data: TrackShipmentDto): Promise<TrackingResult> {
    this.logger.log(`Tracking Loggi shipment ${data.trackingCode}`);
    return {
      status: 'DELIVERED',
      lastUpdate: new Date(),
      events: [],
    };
  }
}
