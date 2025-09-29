import * as dotenv from 'dotenv';
dotenv.config();
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerConfig } from './config/swagger';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import cookieParser = require('cookie-parser');
import { useContainer } from 'class-validator';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  SwaggerConfig.setup(app);
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

  app.setGlobalPrefix(process.env.GLOBAL_PREFIX, { exclude: ['/'] });
  await app.listen(process.env.PORT ?? 3000, () =>
    console.log(`Server is running on port ${process.env.PORT ?? 3000}`),
  );
}
bootstrap();
