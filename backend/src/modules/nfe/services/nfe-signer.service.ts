import { Injectable } from "@nestjs/common";

@Injectable()
export class NfeSignerService {
  signXml(xml: string, certificateBuffer: Buffer, password: string): string {
    // Stub for XMLDSig signature
    return xml.replace("</NFe>", "<Signature>...</Signature></NFe>");
  }
}
