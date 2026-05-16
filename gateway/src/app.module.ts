import { Global, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { RoutesConfig } from './config/routes.config';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { AuthMiddleware } from './middleware/auth.middleware';
import { RateLimitMiddleware } from './middleware/rate-limit.middleware';
import { ProxyModule } from './proxy/proxy.module';
import { AdminModule } from './admin/admin.module';
import { HealthModule } from './health/health.module';

@Global()
@Module({
  providers: [RoutesConfig],
  exports: [RoutesConfig],
})
class ConfigModule {}

@Module({
  imports: [
    ConfigModule,
    ProxyModule,
    AdminModule,
    HealthModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'admin-panel', 'dist'),
      serveRoot: '/admin-ui',
      exclude: ['/api/*', '/admin/*', '/health', '/metrics'],
    }),
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware, AuthMiddleware, RateLimitMiddleware)
      .forRoutes('*');
  }
}
