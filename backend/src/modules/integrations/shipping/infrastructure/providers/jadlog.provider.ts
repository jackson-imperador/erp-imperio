import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IShippingProvider, FreightResult, ShippingLabelResult, TrackingResult } from '../../domain/interfaces/shipping-provider.interface';
import { CalculateFreightDto, GenerateShippingLabelDto, TrackShipmentDto } from '../../domain/dtos/shipping.dto';

@Injectable()
export class JadlogProvider implements IShippingProvider {
  private readonly logger = new Logger(JadlogProvider.name);
  private readonly apiUrl: string;
  private readonly token: string;

  constructor(private readonly configService: ConfigService) {
    this.apiUrl = this.configService.get<string>('JADLOG_API_URL', 'https://www.jadlog.com.br/api');
    this.token = this.configService.get<string>('JADLOG_TOKEN', 'token');
  }

  async calculateFreight(data: CalculateFreightDto): Promise<FreightResult> {
    this.logger.log(`Calculating Jadlog freight for ${data.destinationZipCode}`);
    const response = await fetch(`${this.apiUrl}/freight/cotacao`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Jadlog API error');
    return {
      price: 20.00,
      estimatedDeliveryDays: 3,
      serviceName: 'Jadlog .Com',
    };
  }

  async generateLabel(data: GenerateShippingLabelDto): Promise<ShippingLabelResult> {
    this.logger.log(`Generating Jadlog label for order ${data.orderId}`);
    return {
      trackingCode: 'JL123456789',
      labelUrl: 'https://jadlog.com.br/label/123.pdf',
    };
  }

  async trackShipment(data: TrackShipmentDto): Promise<TrackingResult> {
    this.logger.log(`Tracking Jadlog shipment ${data.trackingCode}`);
    return {
      status: 'DELIVERED',
      lastUpdate: new Date(),
      events: [],
    };
  }
}
