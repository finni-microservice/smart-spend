import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../apps/src/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import express from 'express';

const server = express();

const createNestServer = async (expressInstance: express.Express) => {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressInstance));

  // Enable CORS
  app.enableCors({
    origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : true,
    credentials: true,
  });

  // Enable validation pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Spend Smart API')
    .setDescription('The Spend Smart API documentation')
    .setVersion('1.0')
    .addTag('stripe', 'Stripe payment operations')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  return app.init();
};

createNestServer(server)
  .then(() => console.log('Nest Ready'))
  .catch(err => console.error('Nest broken', err));

export default server;
