import { createParamDecorator, ExecutionContext } from "@nestjs/common";

/**
 * Extracts the company ID from the JWT payload or request header
 * @example @CompanyId() companyId: string
 */
export const CompanyId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.activeCompanyId || request.headers["x-company-id"];
  },
);
