import {UseInterceptors, UploadedFiles, Controller, Post, Req, Res} from '@nestjs/common';
import {FilesInterceptor} from '@nestjs/platform-express';
import {Request, Response} from 'express';
import {OpenAI} from './services/openAI';
import {Basic} from './services/basic';

@Controller()
export class AppController {
  constructor(private readonly basic: Basic, private readonly openAI: OpenAI) {}

  // ------------------ BASIC API ------------------

  @Post('chat')
  async chat(@Req() request: Request) {
    return this.basic.chat(request.body);
  }

  @Post('chat-stream')
  async chatStream(@Req() request: Request, @Res() response: Response) {
    this.basic.chatStream(request.body, response);
  }

  @Post('files')
  @UseInterceptors(FilesInterceptor('files'))
  async files(@UploadedFiles() files: Array<Express.Multer.File>, @Req() request: Request) {
    return this.basic.files(files, request.body);
  }

  // ------------------ OPENAI API ------------------

  @Post('openai-chat')
  async openaiChat(@Req() request: Request) {
    return this.openAI.chat(request.body);
  }

  @Post('openai-chat-stream')
  async openaiChatStream(@Req() request: Request, @Res() response: Response) {
    this.openAI.chatStream(request.body, response);
  }

  @Post('openai-image')
  @UseInterceptors(FilesInterceptor('files'))
  async openaiImage(@UploadedFiles() files: Array<Express.Multer.File>) {
    return this.openAI.imageVariation(files);
  }
}
