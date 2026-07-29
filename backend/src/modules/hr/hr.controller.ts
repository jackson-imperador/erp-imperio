import { Controller, UseGuards, Post, Param, Body, Request } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { HrService } from "./hr.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("HR")
@ApiBearerAuth("JWT")
@UseGuards(JwtAuthGuard)
@Controller("hr")
export class HrController {
  constructor(private readonly hrService: HrService) {}

  @Post("company/:companyId/employees")
  @ApiOperation({ summary: "Create an employee" })
  async createEmployee(
    @Param("companyId") companyId: string,
    @Body() data: any,
    @Request() req: any,
  ) {
    const userId = req.user.sub;
    return this.hrService.createEmployee(companyId, data, userId);
  }

  @Post("company/:companyId/payroll/generate")
  @ApiOperation({ summary: "Generate the payroll for a period" })
  async generatePayroll(
    @Param("companyId") companyId: string,
    @Body("totalAmount") totalAmount: number,
    @Body("dueDate") dueDate: Date,
    @Request() req: any,
  ) {
    const userId = req.user.sub;
    return this.hrService.generatePayroll(companyId, totalAmount, new Date(dueDate), userId);
  }

  @Post("company/:companyId/payroll/:id/pay")
  @ApiOperation({ summary: "Pay a generated payroll" })
  async payPayroll(
    @Param("companyId") companyId: string,
    @Param("id") id: string,
    @Body("bankAccountId") bankAccountId: string,
    @Body("amount") amount: number,
    @Request() req: any,
  ) {
    const userId = req.user.sub;
    return this.hrService.payPayroll(companyId, id, bankAccountId, amount, userId);
  }
}
