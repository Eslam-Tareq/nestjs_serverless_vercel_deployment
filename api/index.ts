// api/index.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module'; 
import { ExpressAdapter } from '@nestjs/platform-express';
import express = require('express');
import { SwaggerConfig } from '../src/config/swagger'; 
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import cookieParser = require('cookie-parser');
import { useContainer } from 'class-validator';
import { INestApplication } from '@nestjs/common';

let cachedApp: INestApplication;

async function bootstrap() {
  if (cachedApp) {
    return cachedApp;
  }

  const expressApp = express();
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
  );

 
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  app.use(cookieParser());


  await app.init();
  cachedApp = app;
  return app;
}

export default async function handler(req, res) {
  const app = await bootstrap();
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp(req, res);
}
