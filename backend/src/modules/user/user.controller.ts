import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  Req,
  Param,
  Post,
  Query,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { UserService } from "./user.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { UpdateUserDto } from "./dto/update-user.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { InviteUserDto } from "./dto/invite-user.dto";
import { UserFilterDto } from "./dto/user-filter.dto";

@ApiTags("Users")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("me")
  @ApiOperation({ summary: "Get current user profile" })
  async getProfile(@Req() req) {
    return this.userService.getProfile(req.user.sub);
  }

  @Put("me")
  @ApiOperation({ summary: "Update current user profile" })
  async updateProfile(@Req() req, @Body() dto: UpdateUserDto) {
    return this.userService.updateProfile(req.user.sub, dto);
  }

  @Put("me/password")
  @ApiOperation({ summary: "Change password" })
  async changePassword(@Req() req, @Body() dto: ChangePasswordDto) {
    return this.userService.changePassword(req.user.sub, dto);
  }

  // Tenant specifics (Should be guarded by RBAC, omitted for brevity here, assumed handled by interceptor/middleware)
  @Get("company/:companyId")
  @ApiOperation({ summary: "Get users for a company" })
  async getCompanyUsers(
    @Param("companyId") companyId: string,
    @Query() query: UserFilterDto,
  ) {
    const skip = ((query.page || 1) - 1) * (query.perPage || 10);
    const take = query.perPage || 10;
    return this.userService.findCompanyUsers(
      companyId,
      skip,
      take,
      query.search,
    );
  }

  @Post("company/:companyId/invite")
  @ApiOperation({ summary: "Invite a user to the company" })
  async inviteUser(
    @Req() req,
    @Param("companyId") companyId: string,
    @Body() dto: InviteUserDto,
  ) {
    return this.userService.inviteUser(companyId, req.user.sub, dto);
  }
}
