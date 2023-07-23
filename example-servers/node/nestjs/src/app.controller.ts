import {UseInterceptors, UploadedFiles, Controller, Post, Req, Res, UseFilters} from '@nestjs/common';
import {HuggingFaceExceptionMiddleware} from './utils/huggingFaceExceptionMiddleware';
import {StabilityAIExceptionMiddleware} from './utils/stabilityAIExceptionMiddleware';
import {OpenAIExceptionMiddleware} from './utils/openAIExceptionMiddleware';
import {CohereExceptionMiddleware} from './utils/cohereExceptionMiddleware';
import {FilesInterceptor} from '@nestjs/platform-express';
import {HuggingFace} from './services/huggingFace';
import {StabilityAI} from './services/stabilityAI';
import {Request, Response} from 'express';
import {Custom} from './services/custom';
import {OpenAI} from './services/openAI';
import {Cohere} from './services/cohere';

@Controller()
export class AppController {
  constructor(
    private readonly custom: Custom,
    private readonly openAI: OpenAI,
    private readonly cohere: Cohere,
    private readonly stabilityAI: StabilityAI,
    private readonly huggingFace: HuggingFace
  ) {}

  // ------------------ CUSTOM API ------------------

  @Post('chat')
  async chat(@Req() request: Request) {
    return this.custom.chat(request.body);
  }

  @Post('chat-stream')
  async chatStream(@Req() request: Request, @Res() response: Response) {
    return this.custom.chatStream(request.body, response);
  }

  @Post('files')
  @UseInterceptors(FilesInterceptor('files'))
  async files(@UploadedFiles() files: Array<Express.Multer.File>, @Req() request: Request) {
    return this.custom.files(files, request.body);
  }

  // ------------------ OPENAI API ------------------

  @Post('openai-chat')
  @UseFilters(new OpenAIExceptionMiddleware())
  async openaiChat(@Req() request: Request) {
    return this.openAI.chat(request.body);
  }

  @Post('openai-chat-stream')
  @UseFilters(new OpenAIExceptionMiddleware())
  async openaiChatStream(@Req() request: Request, @Res() response: Response) {
    return this.openAI.chatStream(request.body, response);
  }

  @Post('openai-image')
  @UseFilters(new OpenAIExceptionMiddleware())
  @UseInterceptors(FilesInterceptor('files'))
  async openaiImage(@UploadedFiles() files: Array<Express.Multer.File>) {
    return this.openAI.imageVariation(files);
  }

  // ------------------ HUGGING FACE API ------------------

  @Post('huggingface-conversation')
  @UseFilters(new HuggingFaceExceptionMiddleware())
  async huggingFaceConversation(@Req() request: Request) {
    return this.huggingFace.conversation(request.body);
  }

  @Post('huggingface-image')
  @UseFilters(new HuggingFaceExceptionMiddleware())
  @UseInterceptors(FilesInterceptor('files'))
  async huggingFaceImage(@UploadedFiles() files: Array<Express.Multer.File>) {
    return this.huggingFace.imageClassification(files);
  }

  @Post('huggingface-speech')
  @UseFilters(new HuggingFaceExceptionMiddleware())
  @UseInterceptors(FilesInterceptor('files'))
  async huggingFaceSpeech(@UploadedFiles() files: Array<Express.Multer.File>) {
    return this.huggingFace.speechRecognition(files);
  }

  // ------------------ STABILITY AI API ------------------

  @Post('stability-text-to-image')
  @UseFilters(new StabilityAIExceptionMiddleware())
  async stabilityTextToImage(@Req() request: Request) {
    return this.stabilityAI.textToImage(request.body);
  }

  @Post('stability-image-to-image')
  @UseFilters(new StabilityAIExceptionMiddleware())
  @UseInterceptors(FilesInterceptor('files'))
  async stabilityImageToImage(@UploadedFiles() files: Array<Express.Multer.File>, @Req() request: Request) {
    return this.stabilityAI.imageToImage(files, request.body);
  }

  @Post('stability-image-upscale')
  @UseFilters(new StabilityAIExceptionMiddleware())
  @UseInterceptors(FilesInterceptor('files'))
  async stabilityImageToImageUpscale(@UploadedFiles() files: Array<Express.Multer.File>) {
    return this.stabilityAI.imageToImageUpscale(files);
  }

  // ------------------ COHERE API ------------------

  @Post('cohere-chat')
  @UseFilters(new CohereExceptionMiddleware())
  async cohereChat(@Req() request: Request) {
    return this.cohere.chat(request.body);
  }

  @Post('cohere-generate')
  @UseFilters(new CohereExceptionMiddleware())
  async cohereGenerate(@Req() request: Request) {
    return this.cohere.generateText(request.body);
  }

  @Post('cohere-summarize')
  @UseFilters(new CohereExceptionMiddleware())
  async cohereSummarize(@Req() request: Request) {
    return this.cohere.summarizeText(request.body);
  }
}
