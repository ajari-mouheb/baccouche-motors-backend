import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class GatewayAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const userId = request.headers['x-user-id'];
    if (!userId) {
      throw new UnauthorizedException('Unauthorized');
    }
    request.user = {
      id: userId,
      role: request.headers['x-user-role'],
      email: request.headers['x-user-email'],
      firstName: request.headers['x-user-firstname'],
      lastName: request.headers['x-user-lastname'],
    };
    return true;
  }
}
