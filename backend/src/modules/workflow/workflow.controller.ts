import { Controller, Post, Body, Param, UseGuards, Req } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { WorkflowService } from "./workflow.service";
import {
  CreateWorkflowDefinitionDto,
  StartWorkflowDto,
  ApproveRequestDto,
} from "./dto/workflow.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";

@ApiTags("Workflow Engine")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("api/v1/companies/:companyId/workflows")
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

  @Post("definitions")
  @Roles("COMPANY_OWNER", "COMPANY_ADMIN", "SUPER_ADMIN")
  @ApiOperation({ summary: "Create a workflow definition" })
  async createDefinition(
    @Param("companyId") companyId: string,
    @Body() dto: CreateWorkflowDefinitionDto,
  ) {
    return this.workflowService.createDefinition(companyId, dto);
  }

  @Post("start/:code")
  @Roles("COMPANY_OWNER", "COMPANY_ADMIN", "MANAGER", "EMPLOYEE")
  @ApiOperation({ summary: "Start a workflow instance" })
  async startWorkflow(
    @Param("companyId") companyId: string,
    @Param("code") code: string,
    @Body() dto: StartWorkflowDto,
    @Req() req: any,
  ) {
    return this.workflowService.startWorkflow(
      companyId,
      code,
      req.user.id,
      dto,
    );
  }

  @Post("requests/:requestId/approve")
  @Roles("COMPANY_OWNER", "COMPANY_ADMIN", "MANAGER", "SUPERVISOR")
  @ApiOperation({ summary: "Approve a workflow request" })
  async approveRequest(
    @Param("companyId") companyId: string,
    @Param("requestId") requestId: string,
    @Body() dto: ApproveRequestDto,
    @Req() req: any,
  ) {
    return this.workflowService.approveRequest(
      companyId,
      requestId,
      req.user.id,
      dto,
    );
  }
}
