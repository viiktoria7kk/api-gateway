import { Injectable, OnModuleInit } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';

export interface Route {
  name: string;
  prefix: string;
  upstream: string;
  authRequired: boolean;
  rateLimit: number;
}

@Injectable()
export class RoutesConfig implements OnModuleInit {
  private routes: Route[] = [];

  onModuleInit() {
    const filePath = join(__dirname, 'routes.json');
    const raw = readFileSync(filePath, 'utf-8');
    this.routes = JSON.parse(raw) as Route[];
  }

  getRoutes(): Route[] {
    return this.routes;
  }

  findRoute(path: string): Route | undefined {
    return this.routes.find((r) => path.startsWith(r.prefix));
  }

  updateRoute(
    name: string,
    patch: Partial<Pick<Route, 'authRequired' | 'rateLimit'>>,
  ): Route | null {
    const route = this.routes.find((r) => r.name === name);
    if (!route) return null;
    Object.assign(route, patch);
    return route;
  }
}
