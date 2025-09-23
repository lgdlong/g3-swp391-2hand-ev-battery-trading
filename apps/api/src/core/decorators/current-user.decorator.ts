import { ExecutionContext, createParamDecorator } from "@nestjs/common";

export interface ReqUser { sub: number; email: string; role?: string; phone?:string;}

export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext): ReqUser => {
    const req = ctx.switchToHttp().getRequest();
    return req.user;
});