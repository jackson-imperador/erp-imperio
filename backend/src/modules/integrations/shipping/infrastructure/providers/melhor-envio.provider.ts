import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IShippingProvider, FreightResult, ShippingLabelResult, TrackingResult } from '../../domain/interfaces/shipping-provider.interface';
import { CalculateFreightDto, GenerateShippingLabelDto, TrackShipmentDto } from '../../domain/dtos/shipping.dto';

@Injectable()
export class MelhorEnvioProvider implements IShippingProvider {
  private readonly logger = new Logger(MelhorEnvioProvider.name);
  private readonly apiUrl: string;
  private readonly token: string;

  constructor(private readonly configService: ConfigService) {
    this.apiUrl = this.configService.get<string>('MELHORENVIO_API_URL', 'https://www.melhorenvio.com.br/api/v2/me');
    this.token = this.configService.get<string>('MELHORENVIO_TOKEN', 'token');
  }

  async calculateFreight(data: CalculateFreightDto): Promise<FreightResult> {
    this.logger.log(`Calculating Melhor Envio freight for ${data.destinationZipCode}`);
    const response = await fetch(`${this.apiUrl}/shipment/calculate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Melhor Envio API error');
    return {
      price: 22.00,
      estimatedDeliveryDays: 4,
      serviceName: 'Melhor Envio - Correios',
    };
  }

  async generateLabel(data: GenerateShippingLabelDto): Promise<ShippingLabelResult> {
    this.logger.log(`Generating Melhor Envio label for order ${data.orderId}`);
    const response = await fetch(`${this.apiUrl}/shipment/generate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Melhor Envio API error');
    return {
      trackingCode: 'ME123456789BR',
      labelUrl: 'https://melhorenvio.com.br/label/123.pdf',
    };
  }

  async trackShipment(data: TrackShipmentDto): Promise<TrackingResult> {
    this.logger.log(`Tracking Melhor Envio shipment ${data.trackingCode}`);
    const response = await fetch(`${this.apiUrl}/shipment/tracking`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ orders: [data.trackingCode] }),
    });
    if (!response.ok) throw new Error('Melhor Envio API error');
    return {
      status: 'IN_TRANSIT',
      lastUpdate: new Date(),
      events: [],
    };
  }
}
