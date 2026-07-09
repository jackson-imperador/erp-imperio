import { Module } from "@nestjs/common";
import { BiService } from "./bi.service";
import { BiController } from "./bi.controller";
import { PrismaModule } from "../../infrastructure/database/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [BiController],
  providers: [BiService],
  exports: [BiService],
})
export class BiModule {}
