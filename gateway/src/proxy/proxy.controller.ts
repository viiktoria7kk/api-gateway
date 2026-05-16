import {
  Controller,
  All,
  Req,
  Res,
  Next,
  OnModuleInit,
} from '@nestjs/common';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { RoutesConfig, Route } from '../config/routes.config';

@Controller()
export class ProxyController implements OnModuleInit {
  private proxies = new Map<string, RequestHandler>();

  constructor(private readonly routesConfig: RoutesConfig) {}

  onModuleInit() {
    for (const route of this.routesConfig.getRoutes()) {
      this.proxies.set(
        route.name,
        createProxyMiddleware({
          target: route.upstream,
          changeOrigin: true,
        }) as unknown as RequestHandler,
      );
    }
  }

  @All('*')
  async handle(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    const route: Route | undefined = this.routesConfig.findRoute(req.path);
    if (!route) {
      return res.status(404).json({ error: 'Route not found' });
    }

    const proxy = this.proxies.get(route.name);
    if (!proxy) {
      return res.status(502).json({ error: 'Bad Gateway', upstream: route.upstream });
    }

    try {
      proxy(req, res, next);
    } catch {
      res.status(502).json({ error: 'Bad Gateway', upstream: route.upstream });
    }
  }
}
