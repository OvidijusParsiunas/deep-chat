import {StabilityAI, StabilityAIImageToImageUpscale} from '../../types/stabilityAI';
import {StabilityAITextToImageResult} from '../../types/stabilityAIResult';
import {RequestHeaderUtils} from '../../utils/HTTP/RequestHeaderUtils';
import {CompletionsHandlers, StreamHandlers} from '../serviceIO';
import {BASE_64_PREFIX} from '../../utils/element/imageUtils';
import {Messages} from '../../views/chat/messages/messages';
import {StabilityAIUtils} from './utils/stabilityAIUtils';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {MessageFiles} from '../../types/messageFile';
import {MessageContent} from '../../types/messages';
import {StabilityAIIO} from './stabilityAIIO';
import {Result} from '../../types/result';
import {DeepChat} from '../../deepChat';

export class StabilityAIImageToImageUpscaleIO extends StabilityAIIO {
  url = 'https://api.stability.ai/v1/generation/esrgan-v1-x2plus/image-to-image/upscale';
  textInputPlaceholderText = 'Describe image changes';
  introPanelMarkUp = `
    <div style="width: 100%; text-align: center; margin-left: -10px"><b>Stability AI</b></div>
    <div style="width: 100%; text-align: center; margin-left: -10px; margin-top: 2px"><b>Image to Image Upscale</b></div>
    <p>Upload an image to generate a new one with higher resolution.</p>
    <p>Click <a href="https://platform.stability.ai/">here</a> for more info.</p>`;

  constructor(deepChat: DeepChat) {
    const {directConnection} = deepChat;
    const apiKey = directConnection?.stabilityAI;
    const defaultFile = {images: {files: {acceptedFormats: '.png', maxNumberOfFiles: 1}}};
    super(deepChat, StabilityAIUtils.buildKeyVerificationDetails(), StabilityAIUtils.buildHeaders, apiKey, defaultFile);
    const config = directConnection?.stabilityAI?.imageToImageUpscale as NonNullable<StabilityAI['imageToImageUpscale']>;
    if (typeof config === 'object') {
      if (config.engineId) this.url = `https://api.stability.ai/v1/generation/${config.engineId}/image-to-image/upscale`;
      StabilityAIImageToImageUpscaleIO.cleanConfig(config);
      Object.assign(this.rawBody, config);
    }
    this.canSendMessage = StabilityAIImageToImageUpscaleIO.canSendFileMessage;
  }

  private static cleanConfig(config: StabilityAIImageToImageUpscale) {
    delete config.engineId;
  }

  private static canSendFileMessage(_?: string, files?: File[]) {
    return !!files?.[0];
  }

  private createFormDataBody(body: StabilityAIImageToImageUpscale, image: File) {
    const formData = new FormData();
    formData.append('image', image);
    Object.keys(body).forEach((key) => {
      formData.append(key, String(body[key as keyof StabilityAIImageToImageUpscale]));
    });
    return formData;
  }

  // prettier-ignore
  override callServiceAPI(messages: Messages, _: MessageContent[],
      completionsHandlers: CompletionsHandlers, __: StreamHandlers, files?: File[]) {
    if (!this.requestSettings) throw new Error('Request settings have not been set up');
    if (!files) throw new Error('Image was not found');
    const formData = this.createFormDataBody(this.rawBody, files[0]);
    // need to pass stringifyBody boolean separately as binding is throwing an error for some reason
    RequestHeaderUtils.temporarilyRemoveContentType(this.requestSettings,
      HTTPRequest.request.bind(this, this, formData, messages, completionsHandlers.onFinish), false);
  }

  override async extractResultData(result: StabilityAITextToImageResult): Promise<Result> {
    if (result.message) throw result.message;
    const files = result.artifacts.map((imageData) => {
      return {base64: `${BASE_64_PREFIX}${imageData.base64}`, type: 'image'};
    }) as MessageFiles;
    return {files};
  }
}
