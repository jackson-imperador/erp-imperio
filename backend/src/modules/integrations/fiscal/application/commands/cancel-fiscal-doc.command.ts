import { CancelFiscalDocDto } from "../../domain/dto/emit-fiscal-doc.dto";

export class CancelFiscalDocCommand {
  constructor(public readonly dto: CancelFiscalDocDto) {}
}
