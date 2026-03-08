import { JwtPayload, sign, verify, SignOptions } from 'jsonwebtoken';
import { UserRole } from '../constants';

export interface JwtUserPayload {
  sub: string;
  email: string;
  role?: UserRole;
  firstName?: string;
  lastName?: string;
  iat?: number;
  exp?: number;
}

export function verifyJwt(token: string, secret: string): JwtUserPayload | null {
  try {
    const decoded = verify(token, secret) as JwtPayload & JwtUserPayload;
    if (decoded.sub && decoded.email) {
      return {
        sub: decoded.sub,
        email: decoded.email,
        role: decoded.role as UserRole | undefined,
        firstName: decoded.firstName,
        lastName: decoded.lastName,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function signJwt(
  payload: { sub: string; email: string; role?: UserRole },
  secret: string,
  expiresIn: string | number = '7d',
): string {
  return sign(payload as object, secret, { expiresIn } as SignOptions);
}
