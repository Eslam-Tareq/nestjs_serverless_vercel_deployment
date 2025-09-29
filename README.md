
## 📂 Project Structure

Here is a breakdown of the key files and directories in this project and their roles in a serverless NestJS deployment on Vercel.

.
├── api/
│   └── index.ts        # Entry point for the Vercel Serverless Function
├── src/
│   ├── app.controller.ts
│   ├── app.module.ts   # The main NestJS application module
│   └── main.ts         # (For local development only)
├── .gitignore
├── nest-cli.json
├── package.json
├── README.md
├── tsconfig.build.json
├── tsconfig.json
└── vercel.json         # Vercel-specific configuration file


### Key Files Explained:

* `api/index.ts`: This is the **most important file for deployment**. Vercel uses this file as the entry point for the serverless function. It initializes the NestJS application and handles incoming requests.
* `src/main.ts`: This is the traditional entry point for a NestJS application. In this setup, it's used **only for running the server locally** during development. It is not used by Vercel for the deployed application.
* `vercel.json`: This file tells Vercel how to build and route requests for your project. It specifies that incoming requests should be directed to the `api/index.ts` serverless function.
* `src/app.module.ts`: The root module of the NestJS application, where all other modules, controllers, and providers are organized.

## 🚀 Serverless Entry Point: `api/index.ts`

This file is the heart of the Vercel deployment. It replaces the traditional `src/main.ts` file for the production environment, allowing our NestJS application to run as a serverless function.

```typescript // api/index.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module'; 
import { ExpressAdapter } from '@nestjs/platform-express';
import express = require('express');
import { INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser = require('cookie-parser');
import { useContainer } from 'class-validator';

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

  // --- Global Configurations ---
  app.enableCors({
    origin: '*', // Be sure to restrict this in a real production environment
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
  
  // Add any other configurations you need from your main.ts
  
  await app.init();
  cachedApp = app;
  return app;
}

export default async function handler(req, res) {
  const app = await bootstrap();
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp(req, res);
}
```







