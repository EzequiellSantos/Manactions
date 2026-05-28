import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Usuario } from '@prisma/client';

export const CurrentUser = createParamDecorator(
  (data: keyof Usuario | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ user: Usuario }>();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);
