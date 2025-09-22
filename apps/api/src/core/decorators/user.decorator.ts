import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthUser } from '../guards/roles.guard';

export const User = createParamDecorator((data: unknown, ctx: ExecutionContext): AuthUser => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});
