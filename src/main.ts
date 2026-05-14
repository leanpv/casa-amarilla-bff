import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import express = require('express');
import { AppModule } from './app.module';

const expressApp = express();
const adapter = new ExpressAdapter(expressApp);

let bootstrapPromise: Promise<void> | null = null;

function bootstrap(): Promise<void> {
  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      const app = await NestFactory.create(AppModule, adapter, { logger: ['error', 'warn'] });
      app.enableCors({ origin: '*' });
      app.setGlobalPrefix('api');
      app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
      await app.init();
    })();
  }
  return bootstrapPromise;
}

export default async function handler(req: any, res: any) {
  try {
    await bootstrap();
    expressApp(req, res);
  } catch (err) {
    console.error('Bootstrap error:', err);
    res.status(500).json({ error: 'Server initialization failed', detail: String(err) });
  }
}

if (!process.env.VERCEL) {
  bootstrap().then(() => {
    const port = process.env.PORT ?? 3000;
    expressApp.listen(port, () => {
      console.log(`Server running on http://localhost:${port}/api`);
    });
  });
}
