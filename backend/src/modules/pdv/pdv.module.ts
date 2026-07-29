import { Module } from '@nestjs/common';
import { PdvController } from './pdv.controller';
import { PdvService } from './pdv.service';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { SalesModule } from '../sales/sales.module';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [SalesModule, ProductModule],
  controllers: [PdvController],
  providers: [PdvService, PrismaService],
  exports: [PdvService]
})
export class PdvModule {}
