import { SetMetadata } from "@nestjs/common";
import { UserRole } from "@prisma/client";

export const ROLES_KEY = "roles";

/**
 * Restricts route access to specified roles
 * @example @Roles(UserRole.MANAGER, UserRole.COMPANY_ADMIN)
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
