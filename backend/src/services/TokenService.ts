import jwt from 'jsonwebtoken';
import { authConfig } from '../config/auth';

export class TokenService {
  static sign(payload: string | object | Buffer): string {
    const secret = authConfig.secret as jwt.Secret;
    return jwt.sign(payload, secret, {
      expiresIn: authConfig.expiration,
      algorithm: authConfig.algorithm as jwt.Algorithm,
    } as jwt.SignOptions);
  }

  static verify(token: string): any {
    return jwt.verify(token, authConfig.secret);
  }

  static decode(token: string): any {
    return jwt.decode(token);
  }
}
