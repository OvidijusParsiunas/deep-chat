import {GlobalExceptionMiddleware} from './utils/globalExceptionMiddleware';
import {HuggingFace} from './services/huggingFace';
import {AppController} from './app.controller';
import {OpenAI} from './services/openAI';
import {Cohere} from './services/cohere';
import {APP_FILTER} from '@nestjs/core';
import {Basic} from './services/basic';
import {Module} from '@nestjs/common';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    Basic,
    OpenAI,
    Cohere,
    HuggingFace,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionMiddleware,
    },
  ],
})
export class AppModule {}
