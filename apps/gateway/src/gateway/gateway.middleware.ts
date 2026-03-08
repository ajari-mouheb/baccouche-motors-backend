import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';
import { verifyJwt } from '@app/shared';

@Injectable()
export class GatewayMiddleware {
  constructor(private readonly config: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction) {
    if (req.path.startsWith('/uploads')) return next();

    const secret = this.config.get<string>('JWT_SECRET');
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (token && secret) {
      const payload = verifyJwt(token, secret);
      if (payload) {
        req.headers['x-user-id'] = payload.sub;
        req.headers['x-user-email'] = (payload as { email?: string }).email ?? '';
        req.headers['x-user-role'] = (payload as { role?: string }).role ?? '';
        req.headers['x-user-firstname'] = (payload as { firstName?: string }).firstName ?? '';
        req.headers['x-user-lastname'] = (payload as { lastName?: string }).lastName ?? '';
      }
    }

    next();
  }
}
