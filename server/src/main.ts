import * as Sentry from '@sentry/nestjs';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { env, isProduction } from './config/env';

if (env.SENTRY_DSN) {
  Sentry.init({ dsn: env.SENTRY_DSN, environment: env.NODE_ENV });
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });
  app.set('trust proxy', 1);
  app.use(helmet({ contentSecurityPolicy: isProduction ? undefined : false }));
  app.use(cookieParser());
  app.enableCors({ origin: env.CLIENT_URL, credentials: true });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.enableShutdownHooks();

  if (!isProduction || env.SWAGGER) {
    const config = new DocumentBuilder()
      .setTitle('API LinguaGo')
      .setDescription(
        "Apprentissage de l'anglais : niveaux, séries d'exercices, progression, favoris et notifications.",
      )
      .setVersion('2.0')
      .addCookieAuth('lg_access')
      .build();
    SwaggerModule.setup('docs', app, () =>
      SwaggerModule.createDocument(app, config),
    );
  }

  await app.listen(env.PORT, '0.0.0.0');
  new Logger('Bootstrap').log(`API prête sur http://localhost:${env.PORT}`);
}

void bootstrap();
