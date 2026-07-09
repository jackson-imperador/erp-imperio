import { Injectable } from "@nestjs/common";

@Injectable()
export class NfeXmlBuilderService {
  buildNfeXml(nfeData: any): string {
    // Stub for SEFAZ XML building logic
    return "<NFe><infNFe>...</infNFe></NFe>";
  }
}
