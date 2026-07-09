import { Controller, Post, Body, Param, UseGuards, Get } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { MobileService } from "./mobile.service";
import { CreateMobileDto } from "./dto/mobile.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";

@ApiTags("MOBILE Module")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("api/v1/companies/:companyId/mobile")
export class MobileController {
  constructor(private readonly service: MobileService) {}

  @Get("status")
  @Roles("COMPANY_OWNER", "COMPANY_ADMIN", "SUPER_ADMIN")
  @ApiOperation({ summary: "Get mobile status" })
  async getStatus(@Param("companyId") companyId: string) {
    return { status: "OK", module: "mobile", companyId };
  }
}
