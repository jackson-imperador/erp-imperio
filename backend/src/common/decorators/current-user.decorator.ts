import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { RequestUser } from "../interfaces/request-user.interface";

/**
 * Extracts the authenticated user from the request object
 * @example @CurrentUser() user: RequestUser
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): RequestUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
