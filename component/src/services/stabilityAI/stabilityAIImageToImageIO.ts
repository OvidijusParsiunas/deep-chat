import {STABILITY_AI_BUILD_HEADERS, STABILITY_AI_BUILD_KEY_VERIFICATION_DETAILS} from './utils/stabilityAIUtils';
import {REQUEST_SETTINGS_ERROR, IMAGE_NOT_FOUND_ERROR} from '../../utils/errorMessages/errorMessages';
import {FILES, IMAGE, IMAGES, SRC, TEXT, TYPE} from '../../utils/consts/messageConstants';
import {StabilityAI, StabilityAIImageToImage} from '../../types/stabilityAI';
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

// WORK - allow appropriate responses for invalid height etc
export class StabilityAIImageToImageIO extends StabilityAIIO {
  url = 'https://api.stability.ai/v1/generation/stable-diffusion-v1-6/image-to-image';
  private readonly _imageWeight: number | undefined;
  textInputPlaceholderText = 'Describe image changes';

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = JSON.parse(JSON.stringify(deepChat.directConnection));
    const apiKey = directConnectionCopy.stabilityAI;
    const defaultFile = {[IMAGES]: {[FILES]: {acceptedFormats: '.png', maxNumberOfFiles: 1}}};
    super(deepChat, STABILITY_AI_BUILD_KEY_VERIFICATION_DETAILS(), STABILITY_AI_BUILD_HEADERS, apiKey, defaultFile);
    const config = directConnectionCopy.stabilityAI?.imageToImage as NonNullable<StabilityAI['imageToImage']>;
    if (typeof config === 'object') {
      if (config.engine_id) this.url = `https://api.stability.ai/v1/generation/${config.engine_id}/text-to-image`;
      if (config.weight !== undefined && config.weight !== null) this._imageWeight = config.weight;
      StabilityAIImageToImageIO.cleanConfig(config);
      Object.assign(this.rawBody, config);
    }
    this.canSendMessage = StabilityAIImageToImageIO.canSendFileTextMessage;
  }

  private static cleanConfig(config: StabilityAIImageToImage) {
    delete config.engine_id;
    delete config.weight;
  }

  private static canSendFileTextMessage(text?: string, files?: File[]) {
    return !!files?.[0] && !!(text && text.trim() !== '');
  }

  private createFormDataBody(body: StabilityAIImageToImage, image: File, text?: string) {
    const formData = new FormData();
    formData.append('init_image', image);
    if (text && text !== '') {
      formData.append('text_prompts[0][text]', text);
    }
    if (this._imageWeight !== undefined && this._imageWeight !== null) {
      formData.append('text_prompts[0][weight]', String(this._imageWeight));
    }
    Object.keys(body).forEach((key) => {
      formData.append(key, String(body[key as keyof StabilityAIImageToImage]));
    });
    if (formData.get('weight') === undefined) {
      formData.append('weight', String(1));
    }
    return formData;
  }

  // prettier-ignore
  override async callServiceAPI(messages: Messages, pMessages: MessageContentI[], files?: File[]) {
    if (!this.connectSettings) throw new Error(REQUEST_SETTINGS_ERROR);
    if (!files) throw new Error(IMAGE_NOT_FOUND_ERROR);
    const lastMessage = pMessages[pMessages.length - 1]?.[TEXT]?.trim();
    const formData = this.createFormDataBody(this.rawBody, files[0], lastMessage);
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
