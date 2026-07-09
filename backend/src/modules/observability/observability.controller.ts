import { Controller, Post, Body, Param, UseGuards, Get } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { ObservabilityService } from "./observability.service";
import { CreateObservabilityDto } from "./dto/observability.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";

@ApiTags("OBSERVABILITY Module")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("api/v1/companies/:companyId/observability")
export class ObservabilityController {
  constructor(private readonly service: ObservabilityService) {}

  @Get("status")
  @Roles("COMPANY_OWNER", "COMPANY_ADMIN", "SUPER_ADMIN")
  @ApiOperation({ summary: "Get observability status" })
  async getStatus(@Param("companyId") companyId: string) {
    return { status: "OK", module: "observability", companyId };
  }
}
