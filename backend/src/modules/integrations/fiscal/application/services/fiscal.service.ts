import { Injectable } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import {
  EmitFiscalDocDto,
  CancelFiscalDocDto,
} from "../../domain/dto/emit-fiscal-doc.dto";
import { EmitFiscalDocCommand } from "../commands/emit-fiscal-doc.command";
import { CancelFiscalDocCommand } from "../commands/cancel-fiscal-doc.command";
import { FiscalDocumentResponse } from "../../domain/interfaces/fiscal-provider.interface";

@Injectable()
export class FiscalService {
  constructor(private readonly commandBus: CommandBus) {}

  async emitDocument(dto: EmitFiscalDocDto): Promise<FiscalDocumentResponse> {
    return this.commandBus.execute(new EmitFiscalDocCommand(dto));
  }

  async cancelDocument(
    dto: CancelFiscalDocDto,
  ): Promise<FiscalDocumentResponse> {
    return this.commandBus.execute(new CancelFiscalDocCommand(dto));
  }
}
