import { Controller, Post, Body, Param, UseGuards, Get } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { PortalService } from "./portal.service";
import { CreatePortalDto } from "./dto/portal.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";

@ApiTags("PORTAL Module")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("api/v1/companies/:companyId/portal")
export class PortalController {
  constructor(private readonly service: PortalService) {}

  @Get("status")
  @Roles("COMPANY_OWNER", "COMPANY_ADMIN", "SUPER_ADMIN")
  @ApiOperation({ summary: "Get portal status" })
  async getStatus(@Param("companyId") companyId: string) {
    return { status: "OK", module: "portal", companyId };
  }
}
