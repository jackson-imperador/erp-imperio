import { Controller, Post, Body, Get, Param, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CalculateFreightDto, GenerateShippingLabelDto, TrackShipmentDto } from '../domain/dtos/shipping.dto';
import { CalculateFreightQuery } from '../application/queries/calculate-freight.query';
import { GenerateShippingLabelCommand } from '../application/commands/generate-shipping-label.command';
import { TrackShipmentQuery } from '../application/queries/track-shipment.query';

@ApiTags('Shipping Integration')
@Controller('shipping')
export class ShippingController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('calculate')
  @ApiOperation({ summary: 'Calculate freight cost and delivery time' })
  @ApiResponse({ status: 200, description: 'Freight calculated successfully.' })
  async calculateFreight(@Body() dto: CalculateFreightDto) {
    return this.queryBus.execute(
      new CalculateFreightQuery(dto.provider, dto.originZipCode, dto.destinationZipCode, dto.weight),
    );
  }

  @Post('label')
  @ApiOperation({ summary: 'Generate shipping label' })
  @ApiResponse({ status: 201, description: 'Label generated successfully.' })
  async generateLabel(@Body() dto: GenerateShippingLabelDto) {
    return this.commandBus.execute(
      new GenerateShippingLabelCommand(dto.provider, dto.orderId, dto.serviceType, dto.recipientName),
    );
  }

  @Get('track')
  @ApiOperation({ summary: 'Track shipment' })
  @ApiResponse({ status: 200, description: 'Tracking info retrieved successfully.' })
  async trackShipment(@Query() dto: TrackShipmentDto) {
    return this.queryBus.execute(
      new TrackShipmentQuery(dto.provider, dto.trackingCode),
    );
  }
}
