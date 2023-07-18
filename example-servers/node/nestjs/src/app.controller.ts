import {UseInterceptors, UploadedFiles, Controller, Post, Req, Res} from '@nestjs/common';
import {FilesInterceptor} from '@nestjs/platform-express';
import {HuggingFace} from './services/huggingFace';
import {Request, Response} from 'express';
import {OpenAI} from './services/openAI';
import {Cohere} from './services/cohere';
import {Basic} from './services/basic';

@Controller()
export class AppController {
  constructor(
    private readonly basic: Basic,
    private readonly openAI: OpenAI,
    private readonly cohere: Cohere,
    private readonly huggingFace: HuggingFace
  ) {}

  // ------------------ BASIC API ------------------

  @Post('chat')
  async chat(@Req() request: Request) {
    return this.basic.chat(request.body);
  }

  @Post('chat-stream')
  async chatStream(@Req() request: Request, @Res() response: Response) {
    return this.basic.chatStream(request.body, response);
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
    return this.openAI.chatStream(request.body, response);
  }

  @Post('openai-image')
  @UseInterceptors(FilesInterceptor('files'))
  async openaiImage(@UploadedFiles() files: Array<Express.Multer.File>) {
    return this.openAI.imageVariation(files);
  }

  // ------------------ HUGGING FACE API ------------------

  @Post('huggingface-conversation')
  async huggingFaceConversation(@Req() request: Request) {
    return this.huggingFace.conversation(request.body);
  }

  @Post('huggingface-image')
  @UseInterceptors(FilesInterceptor('files'))
  async huggingFaceImage(@UploadedFiles() files: Array<Express.Multer.File>) {
    return this.huggingFace.imageClassification(files);
  }

  @Post('huggingface-speech')
  @UseInterceptors(FilesInterceptor('files'))
  async huggingFaceSpeech(@UploadedFiles() files: Array<Express.Multer.File>) {
    return this.huggingFace.speechRecognition(files);
  }

  // ------------------ COHERE API ------------------

  @Post('cohere-generate')
  async cohereGenerate(@Req() request: Request) {
    return this.cohere.generateText(request.body);
  }

  @Post('cohere-summarize')
  async cohereSummarize(@Req() request: Request) {
    return this.cohere.summarizeText(request.body);
  }
}
