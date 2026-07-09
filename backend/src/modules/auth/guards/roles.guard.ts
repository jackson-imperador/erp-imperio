import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UserRole } from "@prisma/client";
import { ROLES_KEY } from "../../../common/decorators/roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) return true;

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException("Authentication required.");
    }

    const roleHierarchy: Record<UserRole, number> = {
      [UserRole.SUPER_ADMIN]: 100,
      [UserRole.PLATFORM_ADMIN]: 90,
      [UserRole.COMPANY_OWNER]: 80,
      [UserRole.COMPANY_ADMIN]: 70,
      [UserRole.MANAGER]: 60,
      [UserRole.SUPERVISOR]: 50,
      [UserRole.EMPLOYEE]: 30,
      [UserRole.VIEWER]: 10,
    };

    const userLevel = roleHierarchy[user.role as UserRole] ?? 0;
    const minRequired = Math.min(
      ...requiredRoles.map((r) => roleHierarchy[r] ?? 0),
    );

    if (userLevel < minRequired) {
      throw new ForbiddenException(
        "You do not have permission to perform this action.",
      );
    }

    return true;
  }
}
