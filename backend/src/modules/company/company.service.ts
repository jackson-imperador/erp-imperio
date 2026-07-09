import { Injectable, NotFoundException } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { CompanyRepository } from "./company.repository";

@Injectable()
export class CompanyService {
  constructor(
    private readonly companyRepository: CompanyRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findById(id: string) {
    const company = await this.companyRepository.findById(id);
    if (!company) throw new NotFoundException(`Company ${id} not found.`);
    return company;
  }

  async update(
    id: string,
    dto: {
      name?: string;
      email?: string;
      phone?: string;
      website?: string;
      logoUrl?: string;
      timezone?: string;
      locale?: string;
      currencyCode?: string;
    },
    userId: string,
  ) {
    const existing = await this.findById(id);

    const updated = await this.companyRepository.update(id, dto);

    this.eventEmitter.emit("entity.updated", {
      companyId: id,
      userId,
      entityName: "Company",
      entityId: id,
      previousData: { name: existing.name, email: existing["email"] },
      newData: dto,
    });

    return updated;
  }

  async getSettings(id: string) {
    return this.companyRepository.findSettings(id);
  }

  async updateSettings(
    id: string,
    settings: Record<string, unknown>,
    userId: string,
  ) {
    const updated = await this.companyRepository.updateSettings(id, settings);

    this.eventEmitter.emit("entity.updated", {
      companyId: id,
      userId,
      entityName: "CompanySettings",
      entityId: id,
      newData: settings,
    });

    return updated;
  }
}
