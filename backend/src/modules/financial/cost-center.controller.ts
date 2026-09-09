import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PrismaService } from "../../infrastructure/database/prisma.service";

@ApiTags("Cost Centers")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("companies/:companyId/cost-centers")
export class CostCenterController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async findAll(@Param("companyId") companyId: string) {
    return this.prisma.costCenter.findMany({ where: { companyId } });
  }

  @Post()
  async create(@Param("companyId") companyId: string, @Body() data: any) {
    return this.prisma.costCenter.create({
      data: {
        companyId,
        code: data.code || "",
        name: data.name || "",
        description: data.description,
      }
    });
  }

  @Put(":id")
  async update(@Param("companyId") companyId: string, @Param("id") id: string, @Body() data: any) {
    return this.prisma.costCenter.update({
      where: { id },
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
      }
    });
  }

  @Delete(":id")
  async remove(@Param("companyId") companyId: string, @Param("id") id: string) {
    return this.prisma.costCenter.delete({
      where: { id }
    });
  }
}
