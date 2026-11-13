import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { MAIL_QUEUE } from './common/messaging/constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [configService.getOrThrow<string>('RABBITMQ_URL')],
      queue: MAIL_QUEUE,
      queueOptions: { durable: true },
      noAck: false,
      prefetchCount: 1,
    },
  });
  
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Registration API')
    .setDescription('API de cadastro de usuários')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);
  
  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
