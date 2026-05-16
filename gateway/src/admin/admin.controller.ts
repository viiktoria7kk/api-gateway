import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { RoutesConfig } from '../config/routes.config';
import { getLogs } from '../middleware/logger.middleware';

@Controller('admin')
export class AdminController {
  constructor(private readonly routesConfig: RoutesConfig) {}

  private isAuthorized(req: Request): boolean {
    const expected = `Bearer ${process.env.ADMIN_TOKEN ?? 'admin-secret'}`;
    return req.headers.authorization === expected;
  }

  @Get('routes')
  getRoutes(@Req() req: Request, @Res() res: Response) {
    if (!this.isAuthorized(req)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    return res.json(this.routesConfig.getRoutes());
  }

  @Patch('routes/:name')
  patchRoute(
    @Param('name') name: string,
    @Body() body: { authRequired?: boolean; rateLimit?: number },
    @Req() req: Request,
    @Res() res: Response,
  ) {
    if (!this.isAuthorized(req)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const updated = this.routesConfig.updateRoute(name, body);
    if (!updated) {
      return res.status(404).json({ error: 'Route not found' });
    }
    return res.json(updated);
  }

  @Get('logs')
  getLogs(@Req() req: Request, @Res() res: Response) {
    if (!this.isAuthorized(req)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    return res.json(getLogs());
  }
}
