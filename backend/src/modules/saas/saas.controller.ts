import { Controller, Post, Body, Param, UseGuards, Get } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { SaasService } from "./saas.service";
import { CreateSaasDto } from "./dto/saas.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";

@ApiTags("SAAS Module")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("api/v1/companies/:companyId/saas")
export class SaasController {
  constructor(private readonly service: SaasService) {}

  @Get("status")
  @Roles("COMPANY_OWNER", "COMPANY_ADMIN", "SUPER_ADMIN")
  @ApiOperation({ summary: "Get saas status" })
  async getStatus(@Param("companyId") companyId: string) {
    return { status: "OK", module: "saas", companyId };
  }
}
