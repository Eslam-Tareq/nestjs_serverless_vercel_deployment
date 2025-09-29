# 🚀 NestJS on Vercel (Serverless Deployment)

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green?logo=node.js)](https://nodejs.org)  
[![NestJS](https://img.shields.io/badge/NestJS-Framework-red?logo=nestjs)](https://nestjs.com)  
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://vercel.com)  

Deploy **NestJS** on **Vercel** as a **serverless function** with a clean separation between local development and production environments.

---

## 📑 Table of Contents

- [📂 Project Structure](#-project-structure)  
- [⚙️ Installation](#️-installation)  
- [🖥️ Local Development](#️-local-development)  
- [🌐 Deployment on Vercel](#-deployment-on-vercel)  
- [🚀 Serverless Entry Point](#-serverless-entry-point-apiindexts)  
- [⚡ vercel.json](#-verceljson)  
- [✅ Features](#-features)  
- [📌 Notes](#-notes)  

---

## 📂 Project Structure

```
.
├── api/
│   └── index.ts        # Entry point for the Vercel Serverless Function
├── src/
│   ├── app.controller.ts
│   ├── app.module.ts   # Root NestJS module
│   └── main.ts         # Local development entry point
├── .gitignore
├── nest-cli.json
├── package.json
├── README.md
├── tsconfig.build.json
├── tsconfig.json
└── vercel.json         # Vercel configuration
```

---

## ⚡ vercel.json

```json
{
  "version": 2,
  "builds": [
    { "src": "api/index.ts", "use": "@vercel/node" }
  ],
  "routes": [
    { "src": "/(.*)", "dest": "api/index.ts" }
  ]
}
```
---
## tsconfig.json
```ts-config
{
  "compilerOptions": {
    "module": "commonjs",
    "esModuleInterop": true, # make sure to set this to true
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    //"baseUrl": "./",   # make sure to uncomment 
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": false,
    "noImplicitAny": false,
    "strictBindCallApply": false,
    "forceConsistentCasingInFileNames": false,
    "noFallthroughCasesInSwitch": false
  }
}

```
---

## 🚀 Serverless Entry Point (`api/index.ts`)

```ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express = require('express');
import { INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser = require('cookie-parser');
import { useContainer } from 'class-validator';

let cachedApp: INestApplication;

async function bootstrap() {
  if (cachedApp) return cachedApp;

  const expressApp = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));

  app.enableCors({ origin: '*', methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', credentials: true });
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
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
```

---
## ⚙️ Installation

```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
npm install
```

---

## 🖥️ Local Development

```bash
npm run start:dev
```

Your app runs on 👉 `http://localhost:3000`

---

## 🌐 Deployment on Vercel

1. Install CLI (optional):

   ```bash
   npm i -g vercel
   ```

2. Deploy:

   ```bash
   vercel
   ```
3. go to vercel dashboard and set environment variables if needed.

4. Production app will serve requests via `api/index.ts`.

---



## ✅ Features

- ⚡ Serverless NestJS app on Vercel  
- 🔄 Cached bootstrap for faster cold starts  
- 🌍 CORS enabled (customize in production)  
- 🔒 Validation & pipes out-of-the-box  
- 🍪 Cookie parsing ready  

---

## 📌 Notes

- Don’t leave `origin: '*'` in production. Restrict it for security.  
- Add interceptors, filters, middlewares inside `api/index.ts` if needed.  
- Remember Vercel functions have execution limits — optimize your code.  
