import { Module } from "@nestjs/common";
import { SupplierController } from "./supplier.controller";
import { SupplierService } from "./supplier.service";
import { SupplierRepository } from "./supplier.repository";

@Module({
  controllers: [SupplierController],
  providers: [SupplierService, SupplierRepository],
  exports: [SupplierService],
})
export class SupplierModule {}
