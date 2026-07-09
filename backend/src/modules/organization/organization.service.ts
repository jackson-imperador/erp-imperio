import { Injectable, NotFoundException } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { OrganizationRepository } from "./organization.repository";
import { CreateDepartmentDto } from "./dto/create-department.dto";
import { CreateEmployeeProfileDto } from "./dto/create-employee-profile.dto";

@Injectable()
export class OrganizationService {
  constructor(
    private readonly orgRepository: OrganizationRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createDepartment(
    companyId: string,
    dto: CreateDepartmentDto,
    userId: string,
  ) {
    const dept = await this.orgRepository.createDepartment(companyId, dto);

    this.eventEmitter.emit("entity.created", {
      entityName: "Department",
      entityId: dept.id,
      companyId,
      userId,
      newData: dept,
    });

    return dept;
  }

  async getDepartments(companyId: string) {
    return this.orgRepository.findDepartments(companyId);
  }

  async createEmployeeProfile(
    companyId: string,
    dto: CreateEmployeeProfileDto,
    userId: string,
  ) {
    const profile = await this.orgRepository.createEmployeeProfile(
      companyId,
      dto,
    );

    this.eventEmitter.emit("entity.created", {
      entityName: "EmployeeProfile",
      entityId: profile.id,
      companyId,
      userId,
      newData: profile,
    });

    return profile;
  }

  async getEmployeeProfiles(companyId: string) {
    return this.orgRepository.findEmployeeProfiles(companyId);
  }

  // ── Teams ───────────────────────────────────────

  async createTeam(companyId: string, dto: any, userId: string) {
    const team = await this.orgRepository.createTeam(companyId, dto);

    this.eventEmitter.emit("entity.created", {
      entityName: "Team",
      entityId: team.id,
      companyId,
      userId,
      newData: team,
    });

    return team;
  }

  // ── Hierarchy & Recursive Queries ───────────────────────────────

  async getDepartmentHierarchy(companyId: string) {
    // In a real scenario, this could use a recursive CTE in raw SQL.
    // With Prisma, we fetch all and build the tree in memory for simplicity, or use include nesting.
    // For large organizations, raw recursive CTE is better. Here we build the tree.
    const allDepartments = await this.orgRepository.findDepartments(companyId);

    const buildTree = (
      departments: any[],
      parentId: string | null = null,
    ): any[] => {
      return departments
        .filter((d) => d.parentId === parentId)
        .map((d) => ({
          ...d,
          children: buildTree(departments, d.id),
        }));
    };

    return buildTree(allDepartments);
  }
}
