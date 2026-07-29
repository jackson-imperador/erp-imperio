import { Module } from "@nestjs/common";
import { InventoryController } from "./inventory.controller";
import { InventoryService } from "./inventory.service";
import { InventoryRepository } from "./inventory.repository";
import { InventoryListener } from "./listeners/inventory.listener";
import { PrismaModule } from "../../infrastructure/database/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [InventoryController],
  providers: [InventoryService, InventoryRepository, InventoryListener],
  exports: [InventoryService],
})
export class InventoryModule {}
