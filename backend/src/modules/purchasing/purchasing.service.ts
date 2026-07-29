import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { PurchasingRepository } from "./purchasing.repository";
import { CreatePurchaseOrderDto } from "./dto/create-purchase-order.dto";
import {
  PurchaseCreatedEvent,
  PurchaseReceivedEvent,
} from "./events/purchase-events";
import { ImportPurchaseXmlDto } from "./dto/import-purchase-xml.dto";

@Injectable()
export class PurchasingService {
  constructor(
    private readonly purchasingRepository: PurchasingRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(
    companyId: string,
    dto: CreatePurchaseOrderDto,
    createdBy: string,
  ) {
    const order = await this.purchasingRepository.create(
      companyId,
      dto,
      createdBy,
    );

    this.eventEmitter.emit(
      "purchase.created",
      new PurchaseCreatedEvent(companyId, order.id, Number(order.totalAmount)),
    );

    return order;
  }

  async receive(
    companyId: string,
    purchaseOrderId: string,
    performedBy: string,
  ) {
    const order = await this.purchasingRepository.receive(
      companyId,
      purchaseOrderId,
      performedBy,
    );

    this.eventEmitter.emit(
      "purchase.received",
      new PurchaseReceivedEvent(companyId, order.id),
    );

    return order;
  }

  async findById(companyId: string, id: string) {
    return this.purchasingRepository.findById(companyId, id);
  }

  async findAll(
    companyId: string,
    skip: number,
    take: number,
    search?: string,
  ) {
    return this.purchasingRepository.findAll(companyId, skip, take, search);
  }

  async importXml(
    companyId: string,
    dto: ImportPurchaseXmlDto,
    createdBy: string,
  ) {
    const result = await this.purchasingRepository.importXml(companyId, dto, createdBy);

    this.eventEmitter.emit(
      "purchase.received",
      new PurchaseReceivedEvent(companyId, result.order.id),
    );

    return result;
  }
}
