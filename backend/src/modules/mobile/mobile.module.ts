import { Module } from "@nestjs/common";
import { MobileService } from "./mobile.service";
import { MobileController } from "./mobile.controller";
import { PrismaModule } from "../../infrastructure/database/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [MobileController],
  providers: [MobileService],
  exports: [MobileService],
})
export class MobileModule {}
