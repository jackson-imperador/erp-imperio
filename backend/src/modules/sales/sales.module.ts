import { Module } from "@nestjs/common";
import { SalesService } from "./sales.service";
import { SalesController } from "./sales.controller";
import { SalesRepository } from "./sales.repository";
import { PrismaModule } from "../../infrastructure/database/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [SalesController],
  providers: [SalesService, SalesRepository],
  exports: [SalesService],
})
export class SalesModule {}
