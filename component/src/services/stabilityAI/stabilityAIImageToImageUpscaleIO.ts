import {STABILITY_AI_BUILD_HEADERS, STABILITY_AI_BUILD_KEY_VERIFICATION_DETAILS} from './utils/stabilityAIUtils';
import {REQUEST_SETTINGS_ERROR, IMAGE_NOT_FOUND_ERROR} from '../../utils/errorMessages/errorMessages';
import {StabilityAI, StabilityAIImageToImageUpscale} from '../../types/stabilityAI';
import {FILES, IMAGE, SRC, TYPE} from '../../utils/consts/messageConstants';
import {StabilityAITextToImageResult} from '../../types/stabilityAIResult';
import {BASE_64_PREFIX} from '../../utils/element/imageUtils';
import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {RequestUtils} from '../../utils/HTTP/requestUtils';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {MessageFiles} from '../../types/messageFile';
import {StabilityAIIO} from './stabilityAIIO';
import {Response} from '../../types/response';
import {DeepChat} from '../../deepChat';

export class StabilityAIImageToImageUpscaleIO extends StabilityAIIO {
  url = 'https://api.stability.ai/v1/generation/esrgan-v1-x2plus/image-to-image/upscale';
  textInputPlaceholderText = 'Describe image changes';

  constructor(deepChat: DeepChat) {
    const directConnectionCp = JSON.parse(JSON.stringify(deepChat.directConnection));
    const apiKey = directConnectionCp?.stabilityAI;
    const defaultFile = {images: {files: {acceptedFormats: '.png', maxNumberOfFiles: 1}}};
    super(deepChat, STABILITY_AI_BUILD_KEY_VERIFICATION_DETAILS(), STABILITY_AI_BUILD_HEADERS, apiKey, defaultFile);
    const config = directConnectionCp?.stabilityAI?.imageToImageUpscale as NonNullable<StabilityAI['imageToImageUpscale']>;
    if (typeof config === 'object') {
      if (config.engine_id) this.url = `https://api.stability.ai/v1/generation/${config.engine_id}/image-to-image/upscale`;
      StabilityAIImageToImageUpscaleIO.cleanConfig(config);
      Object.assign(this.rawBody, config);
    }
    this.canSendMessage = StabilityAIImageToImageUpscaleIO.canSendFileMessage;
  }

  private static cleanConfig(config: StabilityAIImageToImageUpscale) {
    delete config.engine_id;
  }

  private static canSendFileMessage(_?: string, files?: File[]) {
    return !!files?.[0];
  }

  private createFormDataBody(body: StabilityAIImageToImageUpscale, image: File) {
    const formData = new FormData();
    formData.append(IMAGE, image);
    Object.keys(body).forEach((key) => {
      formData.append(key, String(body[key as keyof StabilityAIImageToImageUpscale]));
    });
    return formData;
  }

  // prettier-ignore
  override async callServiceAPI(messages: Messages, _: MessageContentI[], files?: File[]) {
    if (!this.connectSettings) throw new Error(REQUEST_SETTINGS_ERROR);
    if (!files) throw new Error(IMAGE_NOT_FOUND_ERROR);
    const formData = this.createFormDataBody(this.rawBody, files[0]);
    // need to pass stringifyBody boolean separately as binding is throwing an error for some reason
    RequestUtils.tempRemoveContentHeader(this.connectSettings,
      HTTPRequest.request.bind(this, this, formData, messages), false);
  }

  override async extractResultData(result: StabilityAITextToImageResult): Promise<Response> {
    if (result.message) throw result.message;
    const files = result.artifacts.map((imageData) => {
      return {[SRC]: `${BASE_64_PREFIX}${imageData.base64}`, [TYPE]: IMAGE};
    }) as MessageFiles;
    return {[FILES]: files};
  }
}
