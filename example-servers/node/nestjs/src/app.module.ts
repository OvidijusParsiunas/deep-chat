import {AppController} from './app.controller';
import {OpenAI} from './services/openAI';
import {Cohere} from './services/cohere';
import {Basic} from './services/basic';
import {Module} from '@nestjs/common';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [Basic, OpenAI, Cohere],
})
export class AppModule {}
