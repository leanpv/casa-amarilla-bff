import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import express = require('express');
import { AppModule } from './app.module';

const expressApp = express();
const adapter = new ExpressAdapter(expressApp);

let initialized = false;

async function bootstrap() {
  if (initialized) return;
  initialized = true;

  const app = await NestFactory.create(AppModule, adapter);

  app.enableCors({
    origin: [
      'http://localhost:3001',
      process.env.FRONTEND_URL,
    ].filter(Boolean),
    credentials: true,
  });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  await app.init();
}

export default async function handler(req: any, res: any) {
  await bootstrap();
  expressApp(req, res);
}

if (!process.env.VERCEL) {
  bootstrap().then(() => {
    const port = process.env.PORT ?? 3000;
    expressApp.listen(port, () => {
      console.log(`Server running on http://localhost:${port}/api`);
    });
  });
}
