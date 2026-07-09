import { Controller, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { FinancialService } from "./financial.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("Financial")
@ApiBearerAuth("JWT")
@UseGuards(JwtAuthGuard)
@Controller("financial")
export class FinancialController {
  constructor(private readonly financialService: FinancialService) {}
  // TODO: implement endpoints
}
