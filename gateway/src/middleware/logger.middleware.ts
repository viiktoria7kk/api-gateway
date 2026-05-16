import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

interface LogEntry {
  timestamp: string;
  method: string;
  path: string;
  status: number;
  latencyMs: number;
  ip: string;
}

const logs: LogEntry[] = [];

export function getLogs(): LogEntry[] {
  return logs;
}

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    const { method, path, ip } = req;

    res.on('finish', () => {
      const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        method,
        path,
        status: res.statusCode,
        latencyMs: Date.now() - start,
        ip: ip ?? 'unknown',
      };
      if (logs.length >= 500) logs.shift();
      logs.push(entry);
    });

    next();
  }
}
