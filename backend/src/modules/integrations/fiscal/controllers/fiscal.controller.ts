import { Controller, Post, Body, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { FiscalService } from "../application/services/fiscal.service";
import {
  EmitFiscalDocDto,
  CancelFiscalDocDto,
} from "../domain/dto/emit-fiscal-doc.dto";

@ApiTags("Fiscal Documents")
@Controller("integrations/fiscal")
export class FiscalController {
  constructor(private readonly fiscalService: FiscalService) {}

  @Post("emit")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Emit a fiscal document (NF-e, NFC-e, NFS-e, CT-e, MDF-e)",
  })
  @ApiResponse({ status: 200, description: "Document emitted successfully." })
  @ApiResponse({ status: 400, description: "Invalid input." })
  async emit(@Body() dto: EmitFiscalDocDto) {
    return this.fiscalService.emitDocument(dto);
  }

  @Post("cancel")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Cancel a fiscal document" })
  @ApiResponse({ status: 200, description: "Document canceled successfully." })
  @ApiResponse({ status: 400, description: "Invalid input." })
  async cancel(@Body() dto: CancelFiscalDocDto) {
    return this.fiscalService.cancelDocument(dto);
  }
}
