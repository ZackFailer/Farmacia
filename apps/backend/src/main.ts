/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { NextFunction, Request, Response } from 'express';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const certsDir = join(__dirname, 'certs');
  const pfxPath = join(certsDir, 'cert.pfx');
  const httpsOptions = existsSync(pfxPath)
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

  app.setGlobalPrefix(globalPrefix);
  if (existsSync(staticRoot)) {
    app.useStaticAssets(staticRoot);
  }

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api/') || req.method !== 'GET' || !existsSync(staticRoot)) {
      next();
      return;
    }

    res.sendFile('index.html', { root: staticRoot });
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

bootstrap();
