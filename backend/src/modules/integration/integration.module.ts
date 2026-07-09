import { Module } from "@nestjs/common";
import { WebhookService } from "./webhook.service";
import { IntegrationController } from "./integration.controller";
import { PrismaModule } from "../../infrastructure/database/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [IntegrationController],
  providers: [WebhookService],
  exports: [WebhookService],
})
export class IntegrationModule {}
