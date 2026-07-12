import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { NextFunction, Request, Response } from 'express';
import { AppModule } from './app/app.module';

process.on('unhandledRejection', (reason) => {
  Logger.error('Unhandled promise rejection:', (reason as Error)?.message ?? reason);
});

process.on('uncaughtException', (error) => {
  Logger.error('Uncaught exception:', error.message);
});

async function bootstrap() {
  const useHttps = !process.env.DISABLE_HTTPS && !process.env.RAILWAY_ENVIRONMENT;
  const certsDir = join(__dirname, 'certs');
  const pfxPath = join(certsDir, 'cert.pfx');
  const httpsOptions = useHttps && existsSync(pfxPath)
    ? {
        pfx: readFileSync(pfxPath),
        passphrase: 'apopharma',
      }
    : undefined;

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    httpsOptions,
  });

  const globalPrefix = 'api/v1';
  const staticRoot = join(__dirname, '../frontend/browser');
  const hasStatic = existsSync(staticRoot);

  Logger.log(`Static root: ${staticRoot} (exists: ${hasStatic})`);

  app.setGlobalPrefix(globalPrefix);

  if (hasStatic) {
    app.useStaticAssets(staticRoot);
  }

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api/') || req.method !== 'GET' || !hasStatic) {
      next();
      return;
    }
    try {
      res.sendFile('index.html', { root: staticRoot }, (err) => {
        if (err) {
          Logger.error(`sendFile error for ${req.path}: ${err.message}`);
          next();
        }
      });
    } catch (err) {
      Logger.error(`sendFile threw for ${req.path}: ${(err as Error).message}`);
      next();
    }
  });

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    Logger.error(`Express error: ${err.message}`);
    res.status(500).json({ error: 'Internal server error' });
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.enableCors();

  const port = process.env.PORT || 3000;
  const protocol = httpsOptions ? 'https' : 'http';
  await app.listen(port, '0.0.0.0');
  Logger.log(
    `🚀 Application is running on: ${protocol}://localhost:${port}/${globalPrefix}`,
  );
}

bootstrap().catch((err) => {
  Logger.error(`Bootstrap failed: ${err.message}`, err.stack);
  process.exit(1);
});
