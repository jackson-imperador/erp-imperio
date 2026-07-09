import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { OrganizationService } from "./organization.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CreateDepartmentDto } from "./dto/create-department.dto";
import { CreateEmployeeProfileDto } from "./dto/create-employee-profile.dto";

@ApiTags("Organization")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("company/:companyId/organization")
export class OrganizationController {
  constructor(private readonly orgService: OrganizationService) {}

  @Post("departments")
  @ApiOperation({ summary: "Create department" })
  async createDepartment(
    @Param("companyId") companyId: string,
    @Body() dto: CreateDepartmentDto,
    @Req() req,
  ) {
    return this.orgService.createDepartment(companyId, dto, req.user.sub);
  }

  @Get("departments")
  @ApiOperation({ summary: "List departments" })
  async getDepartments(@Param("companyId") companyId: string) {
    return this.orgService.getDepartments(companyId);
  }

  @Post("employees")
  @ApiOperation({ summary: "Create employee profile" })
  async createEmployeeProfile(
    @Param("companyId") companyId: string,
    @Body() dto: CreateEmployeeProfileDto,
    @Req() req,
  ) {
    return this.orgService.createEmployeeProfile(companyId, dto, req.user.sub);
  }

  @Get("employees")
  @ApiOperation({ summary: "List employee profiles" })
  async getEmployeeProfiles(@Param("companyId") companyId: string) {
    return this.orgService.getEmployeeProfiles(companyId);
  }
}
