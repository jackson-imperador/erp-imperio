import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/database/prisma.service";
import { Department, EmployeeProfile } from "@prisma/client";

@Injectable()
export class OrganizationRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Departments
  async createDepartment(companyId: string, data: any): Promise<Department> {
    return this.prisma.department.create({
      data: { ...data, companyId },
    });
  }

  async findDepartments(companyId: string): Promise<Department[]> {
    return this.prisma.department.findMany({
      where: { companyId },
      include: {
        parent: true,
      },
    });
  }

  async findDepartmentById(
    companyId: string,
    id: string,
  ): Promise<Department | null> {
    return this.prisma.department.findFirst({
      where: { id, companyId },
    });
  }

  // Employee Profiles
  async createEmployeeProfile(
    companyId: string,
    data: any,
  ): Promise<EmployeeProfile> {
    return this.prisma.employeeProfile.create({
      data: { ...data, companyId },
    });
  }

  async findEmployeeProfiles(companyId: string) {
    return this.prisma.employeeProfile.findMany({
      where: { companyId },
      include: { user: true, department: true },
    });
  }

  // ── Teams ───────────────────────────────────────

  async createTeam(companyId: string, dto: any) {
    return this.prisma.team.create({
      data: {
        companyId,
        departmentId: dto.departmentId,
        name: dto.name,
        teamLeaderId: dto.leaderId,
      },
    });
  }
}
