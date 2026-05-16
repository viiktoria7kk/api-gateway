import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { RoutesConfig } from '../config/routes.config';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly routesConfig: RoutesConfig) {}

  use(req: Request, res: Response, next: NextFunction) {
    try {
      const route = this.routesConfig.findRoute(req.path);
      if (!route || !route.authRequired) {
        return next();
      }

      const authHeader = req.headers.authorization ?? '';
      const [scheme, token] = authHeader.split(' ');

      if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const secret = process.env.JWT_SECRET ?? 'dev-secret';
      const decoded = jwt.verify(token, secret);
      (req as any)['user'] = decoded;
      next();
    } catch {
      res.status(401).json({ error: 'Unauthorized' });
    }
  }
}
