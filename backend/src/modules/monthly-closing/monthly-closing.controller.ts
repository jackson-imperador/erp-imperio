import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MonthlyClosingService } from './monthly-closing.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('monthly-closing')
@UseGuards(JwtAuthGuard)
export class MonthlyClosingController {
  constructor(private readonly service: MonthlyClosingService) {}

  private getCompanyId(req: { user?: { companyId?: string } }): string {
    const id = req.user?.companyId;
    if (!id) throw new Error('companyId ausente no token JWT.');
    return id;
  }

  private getUserId(req: { user?: { sub?: string; id?: string } }): string {
    return req.user?.sub ?? req.user?.id ?? 'unknown';
  }

  /** GET /monthly-closing — lista histórico de fechamentos */
  @Get()
  async list(@Req() req: Express.Request) {
    const companyId = this.getCompanyId(req as { user?: { companyId?: string } });
    return this.service.listHistory(companyId);
  }

  /** GET /monthly-closing/:year/:month/preview — indicadores sem salvar */
  @Get(':year/:month/preview')
  async preview(
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
    @Req() req: Express.Request,
  ) {
    const companyId = this.getCompanyId(req as { user?: { companyId?: string } });
    return this.service.preview(companyId, month, year);
  }

  /** GET /monthly-closing/:year/:month — snapshot salvo */
  @Get(':year/:month')
  async getOne(
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
    @Req() req: Express.Request,
  ) {
    const companyId = this.getCompanyId(req as { user?: { companyId?: string } });
    return this.service.getOne(companyId, month, year);
  }

  /** POST /monthly-closing/:year/:month/close — fecha o mês */
  @Post(':year/:month/close')
  @HttpCode(HttpStatus.OK)
  async close(
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
    @Req() req: Express.Request,
  ) {
    const companyId = this.getCompanyId(req as { user?: { companyId?: string } });
    const userId = this.getUserId(req as { user?: { sub?: string; id?: string } });
    return this.service.closeMonth(companyId, month, year, userId);
  }

  /** POST /monthly-closing/:year/:month/reopen — reabre mês fechado */
  @Post(':year/:month/reopen')
  @HttpCode(HttpStatus.OK)
  async reopen(
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
    @Body('reason') reason: string,
    @Req() req: Express.Request,
  ) {
    const companyId = this.getCompanyId(req as { user?: { companyId?: string } });
    const userId = this.getUserId(req as { user?: { sub?: string; id?: string } });
    return this.service.reopenMonth(companyId, month, year, userId, reason);
  }
}
