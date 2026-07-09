import { Module } from "@nestjs/common";
import { PurchasingService } from "./purchasing.service";
import { PurchasingController } from "./purchasing.controller";
import { PurchasingRepository } from "./purchasing.repository";
import { PrismaModule } from "../../infrastructure/database/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [PurchasingController],
  providers: [PurchasingService, PurchasingRepository],
  exports: [PurchasingService],
})
export class PurchasingModule {}
