import { EmitFiscalDocDto } from "../../domain/dto/emit-fiscal-doc.dto";

export class EmitFiscalDocCommand {
  constructor(public readonly dto: EmitFiscalDocDto) {}
}
