import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { SalesRepository } from "./sales.repository";
import { CreateSaleOrderDto } from "./dto/create-sale-order.dto";
import { SaleCreatedEvent, SaleConfirmedEvent } from "./events/sale-events";

@Injectable()
export class SalesService {
  constructor(
    private readonly salesRepository: SalesRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(companyId: string, dto: CreateSaleOrderDto) {
    const order = await this.salesRepository.create(companyId, dto);

    this.eventEmitter.emit(
      "sale.created",
      new SaleCreatedEvent(companyId, order.id, Number(order.totalAmount)),
    );

    return order;
  }

  async confirm(companyId: string, saleOrderId: string, performedBy: string) {
    const order = await this.salesRepository.confirm(
      companyId,
      saleOrderId,
      performedBy,
    );

    this.eventEmitter.emit(
      "sale.confirmed",
      new SaleConfirmedEvent(companyId, order.id),
    );

    return order;
  }

  async cancel(companyId: string, id: string, reason: string) {
    return this.salesRepository.cancel(companyId, id, reason);
  }

  async findById(companyId: string, id: string) {
    return this.salesRepository.findById(companyId, id);
  }

  async findAll(
    companyId: string,
    skip: number,
    take: number,
    search?: string,
  ) {
    return this.salesRepository.findAll(companyId, skip, take, search);
  }
}
