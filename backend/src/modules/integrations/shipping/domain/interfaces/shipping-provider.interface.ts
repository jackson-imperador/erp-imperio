import { CalculateFreightDto, GenerateShippingLabelDto, TrackShipmentDto } from '../dtos/shipping.dto';

export interface FreightResult {
  price: number;
  estimatedDeliveryDays: number;
  serviceName: string;
}

export interface ShippingLabelResult {
  trackingCode: string;
  labelUrl: string;
}

export interface TrackingResult {
  status: string;
  lastUpdate: Date;
  events: any[];
}

export interface IShippingProvider {
  calculateFreight(data: CalculateFreightDto): Promise<FreightResult>;
  generateLabel(data: GenerateShippingLabelDto): Promise<ShippingLabelResult>;
  trackShipment(data: TrackShipmentDto): Promise<TrackingResult>;
}
