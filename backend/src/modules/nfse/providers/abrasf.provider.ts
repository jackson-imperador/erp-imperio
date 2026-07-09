import { Injectable } from "@nestjs/common";
import { INfseProvider } from "./infse-provider.interface";

@Injectable()
export class AbrasfProvider implements INfseProvider {
  buildXml(data: any): string {
    return '<EnviarLoteRpsEnvio xmlns="http://www.abrasf.org.br/nfse.xsd">...</EnviarLoteRpsEnvio>';
  }
  async transmit(xml: string): Promise<any> {
    return { status: "AUTHORIZED", protocol: "ABRASF-12345" };
  }
  async cancel(nfseId: string, reason: string): Promise<any> {
    return { status: "CANCELLED", protocol: "ABRASF-CANCEL-12345" };
  }
}
