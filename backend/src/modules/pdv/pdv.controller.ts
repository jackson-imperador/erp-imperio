import { Controller, Get, Post, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PdvService } from './pdv.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateDrawerDto, OpenDrawerDto, CloseDrawerDto, DrawerMovementDto, ProcessPdvSaleDto } from './dto/pdv.dto';

@ApiTags('PDV (Frente de Caixa)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('companies/:companyId/pdv')
export class PdvController {
  constructor(private readonly pdvService: PdvService) {}

  @Get('dashboard')
  @Roles('COMPANY_OWNER', 'COMPANY_ADMIN', 'MANAGER', 'EMPLOYEE')
  @ApiOperation({ summary: 'Get PDV dashboard metrics' })
  async getDashboard(@Param('companyId') companyId: string) {
    return this.pdvService.getDashboard(companyId);
  }

  @Get('products/search')
  @Roles('COMPANY_OWNER', 'COMPANY_ADMIN', 'MANAGER', 'EMPLOYEE')
  @ApiOperation({ summary: 'Search products by barcode, SKU, internal code or name' })
  async searchProducts(@Param('companyId') companyId: string, @Query('query') query: string) {
    return this.pdvService.searchProducts(companyId, query);
  }

  @Get('drawers')
  @Roles('COMPANY_OWNER', 'COMPANY_ADMIN', 'MANAGER', 'EMPLOYEE')
  @ApiOperation({ summary: 'List all cash drawers for the company' })
  async listDrawers(@Param('companyId') companyId: string) {
    return this.pdvService.listDrawers(companyId);
  }

  @Post('drawers')
  @Roles('COMPANY_OWNER', 'COMPANY_ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Create a new cash drawer terminal' })
  async createDrawer(
    @Param('companyId') companyId: string,
    @Body() dto: CreateDrawerDto,
  ) {
    return this.pdvService.createDrawer(companyId, dto);
  }

  @Post('drawers/:id/open')
  @Roles('COMPANY_OWNER', 'COMPANY_ADMIN', 'MANAGER', 'EMPLOYEE')
  @ApiOperation({ summary: 'Open a cash drawer with initial balance' })
  async openDrawer(
    @Param('companyId') companyId: string,
    @Param('id') drawerId: string,
    @Body() dto: OpenDrawerDto,
    @Req() req: any,
  ) {
    return this.pdvService.openDrawer(companyId, drawerId, dto, req.user.id);
  }

  @Post('drawers/:id/close')
  @Roles('COMPANY_OWNER', 'COMPANY_ADMIN', 'MANAGER', 'EMPLOYEE')
  @ApiOperation({ summary: 'Close a cash drawer with final balance' })
  async closeDrawer(
    @Param('companyId') companyId: string,
    @Param('id') drawerId: string,
    @Body() dto: CloseDrawerDto,
    @Req() req: any,
  ) {
    return this.pdvService.closeDrawer(companyId, drawerId, dto, req.user.id);
  }

  @Post('drawers/:id/movements')
  @Roles('COMPANY_OWNER', 'COMPANY_ADMIN', 'MANAGER', 'EMPLOYEE')
  @ApiOperation({ summary: 'Add a manual supply, withdrawal or sangria to the cash drawer' })
  async addMovement(
    @Param('companyId') companyId: string,
    @Param('id') drawerId: string,
    @Body() dto: DrawerMovementDto,
    @Req() req: any,
  ) {
    // Capturar IP do operador para auditoria
    const ipAddress = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
      || req.socket?.remoteAddress
      || null;
    return this.pdvService.addMovement(companyId, drawerId, dto, req.user.id, ipAddress);
  }

  // V2.2 — Listar movimentos de um caixa
  @Get('drawers/:id/movements')
  @Roles('COMPANY_OWNER', 'COMPANY_ADMIN', 'MANAGER', 'EMPLOYEE')
  @ApiOperation({ summary: 'List all movements of a cash drawer' })
  async listMovements(
    @Param('companyId') companyId: string,
    @Param('id') drawerId: string,
  ) {
    return this.pdvService.listMovements(companyId, drawerId);
  }

  // V2.2 — Resumo financeiro completo do caixa
  @Get('drawers/:id/summary')
  @Roles('COMPANY_OWNER', 'COMPANY_ADMIN', 'MANAGER', 'EMPLOYEE')
  @ApiOperation({ summary: 'Get full financial summary for a cash drawer session (V2.2)' })
  async getDrawerSummary(
    @Param('companyId') companyId: string,
    @Param('id') drawerId: string,
  ) {
    return this.pdvService.getDrawerSummary(companyId, drawerId);
  }

  // V2.2 — Listar sangrias para módulo Financeiro com filtros
  @Get('withdrawals')
  @Roles('COMPANY_OWNER', 'COMPANY_ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'List all withdrawals/sangrias with filters for Financeiro module (V2.2)' })
  async listWithdrawals(
    @Param('companyId') companyId: string,
    @Query('drawerId') drawerId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('performedBy') performedBy?: string,
    @Query('destination') destination?: string,
  ) {
    return this.pdvService.listWithdrawals(companyId, {
      drawerId,
      startDate,
      endDate,
      performedBy,
      destination,
    });
  }

  @Post('sales')
  @Roles('COMPANY_OWNER', 'COMPANY_ADMIN', 'MANAGER', 'EMPLOYEE')
  @ApiOperation({ summary: 'Process a new POS sale' })
  async processSale(
    @Param('companyId') companyId: string,
    @Body() dto: ProcessPdvSaleDto,
    @Req() req: any,
  ) {
    return this.pdvService.processSale(companyId, dto, req.user.id);
  }
}
