import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AccountRole } from '../../shared/enums/account-role.enum';
import { ROLES_KEY } from '../../shared/constants';

export interface AuthUser {
  sub: number;
  role: AccountRole;
}

interface AuthenticatedRequest {
  user: AuthUser;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    /**
     * 1. Lấy metadata từ decorator @Roles(...)
     *    - Ưu tiên method → fallback controller
     *    - VD: @Roles(AccountRole.ADMIN)
     */
    const requiredRoles = this.reflector.getAllAndOverride<AccountRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // 2. Nếu route không yêu cầu role cụ thể → cho phép qua
    if (!requiredRoles?.length) {
      return true;
    }

    /**
     * 3. Lấy thông tin user từ request
     *    - JwtAuthGuard sẽ gắn user (JWT payload) sau khi xác thực thành công
     */
    const request: AuthenticatedRequest = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user: AuthUser = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    if (!user.role) {
      throw new ForbiddenException('Invalid user role data');
    }

    // 4. Kiểm tra role của user có nằm trong requiredRoles hay không
    const hasRole = requiredRoles.includes(user.role);
    if (!hasRole) {
      throw new ForbiddenException('Insufficient role permissions');
    }

    // 5. Nếu có role phù hợp → cho phép truy cập
    return true;
  }
}
