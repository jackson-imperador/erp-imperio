import { Controller, Post, Body, Param, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { EsocialService } from "./esocial.service";
import { ReinfService } from "./reinf.service";
import { DctfWebService } from "./dctfweb.service";
import {
  GenerateEsocialEventDto,
  GenerateReinfEventDto,
  CloseDctfWebDto,
} from "./dto/federal.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";

@ApiTags("Federal Compliance (eSocial, Reinf, DCTFWeb)")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("api/v1/companies/:companyId/federal")
export class FederalComplianceController {
  constructor(
    private readonly esocialService: EsocialService,
    private readonly reinfService: ReinfService,
    private readonly dctfWebService: DctfWebService,
  ) {}

  @Post("esocial/generate")
  @Roles("COMPANY_OWNER", "COMPANY_ADMIN", "MANAGER")
  @ApiOperation({ summary: "Generate eSocial Event" })
  async generateEsocial(
    @Param("companyId") companyId: string,
    @Body() dto: GenerateEsocialEventDto,
  ) {
    return this.esocialService.generateEvent(companyId, dto);
  }

  @Post("reinf/generate")
  @Roles("COMPANY_OWNER", "COMPANY_ADMIN", "MANAGER")
  @ApiOperation({ summary: "Generate EFD-Reinf Event" })
  async generateReinf(
    @Param("companyId") companyId: string,
    @Body() dto: GenerateReinfEventDto,
  ) {
    return this.reinfService.generateEvent(companyId, dto);
  }

  @Post("dctfweb/close")
  @Roles("COMPANY_OWNER", "COMPANY_ADMIN", "MANAGER")
  @ApiOperation({ summary: "Close DCTFWeb Period" })
  async closeDctfWeb(
    @Param("companyId") companyId: string,
    @Body() dto: CloseDctfWebDto,
  ) {
    return this.dctfWebService.closePeriod(companyId, dto);
  }
}
