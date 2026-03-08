import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtOptionalGuard extends AuthGuard('jwt') {
  handleRequest<T>(err: Error | null, user: T | false): T | undefined {
    if (err || !user) {
      return undefined;
    }
    return user;
  }
}
