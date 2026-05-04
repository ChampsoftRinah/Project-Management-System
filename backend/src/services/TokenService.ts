import jwt from 'jsonwebtoken';
import { authConfig } from '../config/auth';

export class TokenService {
  static sign(payload: object): string {
    return jwt.sign(payload, authConfig.secret, {
      expiresIn: authConfig.expiration,
      algorithm: authConfig.algorithm as jwt.Algorithm,
    });
  }

  static verify(token: string): any {
    return jwt.verify(token, authConfig.secret);
  }

  static decode(token: string): any {
    return jwt.decode(token);
  }
}
