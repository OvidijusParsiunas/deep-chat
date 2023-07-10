import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {config} from 'dotenv';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // this will need to be reconfigured before taking the app to production
  app.enableCors();

  config();

  await app.listen(8080);
}
bootstrap();
