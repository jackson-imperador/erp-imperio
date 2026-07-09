import { Injectable, NotFoundException } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { CustomerRepository } from "./customer.repository";
import { CreateCustomerDto } from "./dto/create-customer.dto";

@Injectable()
export class CustomerService {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(companyId: string, dto: CreateCustomerDto, userId: string) {
    const { addresses, contacts, ...customerData } = dto;
    const customer = await this.customerRepository.create(companyId, {
      ...customerData,
      company: { connect: { id: companyId } },
      addresses: addresses?.length ? { create: addresses } : undefined,
      contacts: contacts?.length ? { create: contacts } : undefined,
    });

    this.eventEmitter.emit("entity.created", {
      entityName: "Customer",
      entityId: customer.id,
      companyId,
      userId,
      newData: customer,
    });

    return customer;
  }

  async findAll(
    companyId: string,
    skip: number = 0,
    take: number = 10,
    search?: string,
  ) {
    return this.customerRepository.findAll(companyId, skip, take, search);
  }

  async findById(companyId: string, id: string) {
    const customer = await this.customerRepository.findById(companyId, id);
    if (!customer) throw new NotFoundException("Customer not found");
    return customer;
  }
}
