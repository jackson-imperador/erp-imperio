import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { CompanyService } from "./company.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("Companies")
@ApiBearerAuth("JWT")
@UseGuards(JwtAuthGuard)
@Controller("companies")
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.companyService.findById(id);
  }
}
