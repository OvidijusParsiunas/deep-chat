import {StabilityAI, StabilityAIImageToImageMasking} from '../../types/stabilityAI';
import {StabilityAITextToImageResult} from '../../types/stabilityAIResult';
import {BASE_64_PREFIX} from '../../utils/element/imageUtils';
import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {RequestUtils} from '../../utils/HTTP/requestUtils';
import {StabilityAIUtils} from './utils/stabilityAIUtils';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {MessageFiles} from '../../types/messageFile';
import {StabilityAIIO} from './stabilityAIIO';
import {Response} from '../../types/response';
import {DeepChat} from '../../deepChat';

export class StabilityAIImageToImageMaskingIO extends StabilityAIIO {
  url = 'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/image-to-image/masking';
  private readonly _imageWeight: number | undefined;
  private readonly _maskSource: StabilityAIImageToImageMasking['mask_source'] = 'MASK_IMAGE_WHITE';
  textInputPlaceholderText = 'Describe image changes';
  introPanelMarkUp = `
    <div style="width: 100%; text-align: center; margin-left: -10px"><b>Stability AI</b></div>
    <div style="width: 100%; text-align: center; margin-left: -10px; margin-top: 5px"><b>Image to Image Masking</b></div>
    <p>Upload an image, its mask image to create a new one based on the changes you have described for the mask area.</p>
    <p>Click <a href="https://platform.stability.ai/">here</a> for more info.</p>`;

  constructor(deepChat: DeepChat) {
    const directConnectionCp = JSON.parse(JSON.stringify(deepChat.directConnection));
    const apiKey = directConnectionCp?.stabilityAI;
    const defaultFile = {images: {files: {acceptedFormats: '.png', maxNumberOfFiles: 2}}};
    super(deepChat, StabilityAIUtils.buildKeyVerificationDetails(), StabilityAIUtils.buildHeaders, apiKey, defaultFile);
    const config = directConnectionCp?.stabilityAI?.imageToImageMasking as NonNullable<StabilityAI['imageToImageMasking']>;
    if (typeof config === 'object') {
      if (config.engine_id) this.url = `https://api.stability.ai/v1/generation/${config.engine_id}/image-to-image/masking`;
      if (config.weight !== undefined && config.weight !== null) this._imageWeight = config.weight;
      if (config.mask_source !== undefined && config.mask_source !== null) this._maskSource = config.mask_source;
      StabilityAIImageToImageMaskingIO.cleanConfig(config);
      Object.assign(this.rawBody, config);
    }
    this.canSendMessage = StabilityAIImageToImageMaskingIO.canSendFileTextMessage;
  }

  private static cleanConfig(config: StabilityAIImageToImageMasking) {
    delete config.engine_id;
    delete config.weight;
  }

  private static canSendFileTextMessage(text?: string, files?: File[]) {
    return !!files?.[0] && !!(text && text.trim() !== '');
  }

  private createFormDataBody(body: StabilityAIImageToImageMasking, image: File, mask: File, text?: string) {
    const formData = new FormData();
    formData.append('init_image', image);
    formData.append('mask_source', String(this._maskSource));
    formData.append('mask_image', mask);
    if (text && text !== '') {
      formData.append('text_prompts[0][text]', text);
    }
    if (this._imageWeight !== undefined && this._imageWeight !== null) {
      formData.append('text_prompts[0][weight]', String(this._imageWeight));
    }
    Object.keys(body).forEach((key) => {
      formData.append(key, String(body[key as keyof StabilityAIImageToImageMasking]));
    });
    if (formData.get('weight') === undefined) {
      formData.append('weight', String(1));
    }
    return formData;
  }

  // prettier-ignore
  override async callServiceAPI(messages: Messages, pMessages: MessageContentI[], files?: File[]) {
    if (!this.connectSettings) throw new Error('Request settings have not been set up');
    if (!files || !files[0] || !files[1]) throw new Error('Image was not found');
    const lastMessage = pMessages[pMessages.length - 1]?.text?.trim();
    const formData = this.createFormDataBody(this.rawBody, files[0], files[1], lastMessage);
    // need to pass stringifyBody boolean separately as binding is throwing an error for some reason
    RequestUtils.tempRemoveContentHeader(this.connectSettings,
      HTTPRequest.request.bind(this, this, formData, messages), false);
  }

  override async extractResultData(result: StabilityAITextToImageResult): Promise<Response> {
    if (result.message) throw result.message;
    const files = result.artifacts.map((imageData) => {
      return {src: `${BASE_64_PREFIX}${imageData.base64}`, type: 'image'};
    }) as MessageFiles;
    return {files};
  }
}
