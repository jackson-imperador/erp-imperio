import { Injectable, NotFoundException } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { SupplierRepository } from "./supplier.repository";
import { CreateSupplierDto } from "./dto/create-supplier.dto";

@Injectable()
export class SupplierService {
  constructor(
    private readonly supplierRepository: SupplierRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(companyId: string, dto: CreateSupplierDto, userId: string) {
    const supplier = await this.supplierRepository.create(companyId, {
      ...dto,
      company: { connect: { id: companyId } },
    });

    this.eventEmitter.emit("entity.created", {
      entityName: "Supplier",
      entityId: supplier.id,
      companyId,
      userId,
      newData: supplier,
    });

    return supplier;
  }

  async findAll(
    companyId: string,
    skip: number = 0,
    take: number = 10,
    search?: string,
  ) {
    return this.supplierRepository.findAll(companyId, skip, take, search);
  }

  async findById(companyId: string, id: string) {
    const supplier = await this.supplierRepository.findById(companyId, id);
    if (!supplier) throw new NotFoundException("Supplier not found");
    return supplier;
  }
}
