import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common/pipes';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());

  const config = app.get(ConfigService);

  const host = config.getOrThrow<string>('app.host');
  const port = config.getOrThrow<string>('app.port');

  await app.listen(port);
}
bootstrap();
