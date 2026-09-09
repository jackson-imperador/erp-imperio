import { Module } from '@nestjs/common';
import { MonthlyClosingService } from './monthly-closing.service';
import { MonthlyClosingController } from './monthly-closing.controller';
import { PrismaModule } from '../../infrastructure/database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MonthlyClosingController],
  providers: [MonthlyClosingService],
  exports: [MonthlyClosingService],
})
export class MonthlyClosingModule {}
