import { Controller, Post, Body, Param, UseGuards, Get } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { BiService } from "./bi.service";
import { CreateBiDto } from "./dto/bi.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";

@ApiTags("BI Module")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("api/v1/companies/:companyId/bi")
export class BiController {
  constructor(private readonly service: BiService) {}

  @Get("status")
  @Roles("COMPANY_OWNER", "COMPANY_ADMIN", "SUPER_ADMIN")
  @ApiOperation({ summary: "Get bi status" })
  async getStatus(@Param("companyId") companyId: string) {
    return { status: "OK", module: "bi", companyId };
  }
}
