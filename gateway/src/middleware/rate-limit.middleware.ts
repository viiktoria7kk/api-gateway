import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RoutesConfig } from '../config/routes.config';

const WINDOW_MS = 60_000;

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private counters = new Map<string, number[]>();

  constructor(private readonly routesConfig: RoutesConfig) {}

  use(req: Request, res: Response, next: NextFunction) {
    try {
      const route = this.routesConfig.findRoute(req.path);
      if (!route) return next();

      const key = `${req.ip}:${route.name}`;
      const now = Date.now();
      const timestamps = (this.counters.get(key) ?? []).filter(
        (t) => now - t < WINDOW_MS,
      );

      const limit = route.rateLimit;

      if (timestamps.length >= limit) {
        res.setHeader('X-RateLimit-Limit', limit);
        res.setHeader('X-RateLimit-Remaining', 0);
        return res.status(429).json({ error: 'Too Many Requests' });
      }

      timestamps.push(now);
      this.counters.set(key, timestamps);

      res.setHeader('X-RateLimit-Limit', limit);
      res.setHeader('X-RateLimit-Remaining', limit - timestamps.length);
      next();
    } catch {
      next();
    }
  }
}
