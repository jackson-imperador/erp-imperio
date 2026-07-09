import { Controller, Post, Body, Headers } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from "@nestjs/swagger";
import {
  GenerateBoletoDto,
  ProcessPixDto,
} from "../../domain/dtos/banking.dtos";
import {
  GenerateBoletoCommand,
  ProcessPixCommand,
} from "../../application/commands/banking.commands";

@ApiTags("Banking Integrations")
@Controller("integrations/banking")
export class BankingController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post("boleto")
  @ApiOperation({ summary: "Generate Boleto" })
  @ApiHeader({ name: "x-tenant-id", required: false })
  @ApiResponse({ status: 201, description: "Boleto generated successfully." })
  async generateBoleto(
    @Body() dto: GenerateBoletoDto,
    @Headers("x-tenant-id") tenantId?: string,
  ) {
    return this.commandBus.execute(
      new GenerateBoletoCommand(
        dto.provider,
        dto.amount,
        dto.dueDate,
        dto.payerName,
        dto.payerDocument,
        dto.tenantId || tenantId,
      ),
    );
  }

  @Post("pix")
  @ApiOperation({ summary: "Process PIX Payment" })
  @ApiHeader({ name: "x-tenant-id", required: false })
  @ApiResponse({ status: 201, description: "PIX processed successfully." })
  async processPix(
    @Body() dto: ProcessPixDto,
    @Headers("x-tenant-id") tenantId?: string,
  ) {
    return this.commandBus.execute(
      new ProcessPixCommand(
        dto.provider,
        dto.amount,
        dto.description,
        dto.txid,
        dto.tenantId || tenantId,
      ),
    );
  }
}
