import { Injectable, Logger } from "@nestjs/common";
import { FiscalProviderType } from "../../domain/enums/fiscal.enum";
import { IFiscalProvider } from "../../domain/interfaces/fiscal-provider.interface";
import { FocusNfeProvider } from "./focus-nfe.provider";
import { WebmaniaProvider } from "./webmania.provider";
import { SefazDirectProvider } from "./sefaz-direct.provider";

@Injectable()
export class FiscalProviderFactory {
  private readonly logger = new Logger(FiscalProviderFactory.name);

  constructor(
    private readonly focusNfeProvider: FocusNfeProvider,
    private readonly webmaniaProvider: WebmaniaProvider,
    private readonly sefazDirectProvider: SefazDirectProvider,
  ) {}

  getProvider(providerType?: FiscalProviderType): IFiscalProvider {
    switch (providerType) {
      case FiscalProviderType.FOCUS_NFE:
        return this.focusNfeProvider;
      case FiscalProviderType.WEBMANIA:
        return this.webmaniaProvider;
      case FiscalProviderType.SEFAZ_DIRECT:
        return this.sefazDirectProvider;
      default:
        this.logger.warn(
          `Provider not specified or invalid. Defaulting to FOCUS_NFE.`,
        );
        return this.focusNfeProvider;
    }
  }
}
