import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../constants';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class GatewayRolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles?.length) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const role = request.headers['x-user-role'] as string;
    if (!role) {
      throw new ForbiddenException('Forbidden');
    }
    return requiredRoles.some((r) => r === role);
  }
}
