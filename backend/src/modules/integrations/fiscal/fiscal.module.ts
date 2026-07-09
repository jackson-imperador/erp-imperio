import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { FiscalController } from "./controllers/fiscal.controller";
import { FiscalService } from "./application/services/fiscal.service";
import { FiscalProviderFactory } from "./infrastructure/providers/fiscal-provider.factory";
import { FocusNfeProvider } from "./infrastructure/providers/focus-nfe.provider";
import { WebmaniaProvider } from "./infrastructure/providers/webmania.provider";
import { SefazDirectProvider } from "./infrastructure/providers/sefaz-direct.provider";
import { EmitFiscalDocHandler } from "./application/handlers/emit-fiscal-doc.handler";
import { CancelFiscalDocHandler } from "./application/handlers/cancel-fiscal-doc.handler";

const CommandHandlers = [EmitFiscalDocHandler, CancelFiscalDocHandler];
const Providers = [
  FiscalProviderFactory,
  FocusNfeProvider,
  WebmaniaProvider,
  SefazDirectProvider,
];

@Module({
  imports: [CqrsModule],
  controllers: [FiscalController],
  providers: [FiscalService, ...Providers, ...CommandHandlers],
  exports: [FiscalService],
})
export class FiscalIntegrationModule {}
