import { Controller, Post, Body, Param, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { PixService } from "./pix.service";
import { BoletoService } from "./boleto.service";
import { ReconciliationService } from "./reconciliation.service";
import { GeneratePixChargeDto, GenerateBoletoDto } from "./dto/finance.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";

@ApiTags("Brazilian Finance (PIX, Boletos, CNAB, Open Finance, TEF)")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("api/v1/companies/:companyId/br-finance")
export class BrazilianFinanceController {
  constructor(
    private readonly pixService: PixService,
    private readonly boletoService: BoletoService,
    private readonly reconciliationService: ReconciliationService,
  ) {}

  @Post("pix/charge")
  @Roles("COMPANY_OWNER", "COMPANY_ADMIN", "MANAGER")
  @ApiOperation({ summary: "Create a PIX Charge (Cob)" })
  async createPixCharge(
    @Param("companyId") companyId: string,
    @Body() dto: GeneratePixChargeDto,
  ) {
    return this.pixService.createCharge(companyId, dto);
  }

  @Post("boleto/generate")
  @Roles("COMPANY_OWNER", "COMPANY_ADMIN", "MANAGER")
  @ApiOperation({ summary: "Generate Boleto (Registered)" })
  async generateBoleto(
    @Param("companyId") companyId: string,
    @Body() dto: GenerateBoletoDto,
  ) {
    return this.boletoService.createBoleto(companyId, dto);
  }

  @Post("reconcile")
  @Roles("COMPANY_OWNER", "COMPANY_ADMIN", "MANAGER")
  @ApiOperation({ summary: "Run Automatic Bank Reconciliation" })
  async runReconciliation(@Param("companyId") companyId: string) {
    return this.reconciliationService.runAutomaticReconciliation(companyId);
  }
}
