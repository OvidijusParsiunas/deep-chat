import {GlobalExceptionMiddleware} from './utils/globalExceptionMiddleware';
import {HuggingFace} from './services/huggingFace';
import {StabilityAI} from './services/stabilityAI';
import {AppController} from './app.controller';
import {OpenAI} from './services/openAI';
import {Cohere} from './services/cohere';
import {Custom} from './services/custom';
import {APP_FILTER} from '@nestjs/core';
import {Module} from '@nestjs/common';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    Custom,
    OpenAI,
    Cohere,
    StabilityAI,
    HuggingFace,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionMiddleware,
    },
  ],
})
export class AppModule {}
