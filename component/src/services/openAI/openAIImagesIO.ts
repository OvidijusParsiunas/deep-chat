import {BASE_64_PREFIX} from '../../utils/element/imageUtils';
import {Messages} from '../../views/chat/messages/messages';
import {RequestUtils} from '../../utils/HTTP/requestUtils';
import {OpenAIImageResult} from '../../types/openAIResult';
import {DirectServiceIO} from '../utils/directServiceIO';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {OpenAI, OpenAIImages} from '../../types/openAI';
import {MessageFiles} from '../../types/messageFile';
import {MessageContent} from '../../types/messages';
import {OpenAIUtils} from './utils/openAIUtils';
import {Response} from '../../types/response';
import {DeepChat} from '../../deepChat';

export class OpenAIImagesIO extends DirectServiceIO {
  override insertKeyPlaceholderText = 'OpenAI API Key';
  override getKeyLink = 'https://platform.openai.com/account/api-keys';
  private static readonly IMAGE_GENERATION_URL = 'https://api.openai.com/v1/images/generations';
  private static readonly IMAGE_VARIATIONS_URL = 'https://api.openai.com/v1/images/variations';
  private static readonly IMAGE_EDIT_URL = 'https://api.openai.com/v1/images/edits';

  introPanelMarkUp = `
    <div style="width: 100%; text-align: center; margin-left: -10px"><b>OpenAI DALL·E</b></div>
    <p><b>Insert text</b> to generate an image.</p>
    <p><b>Upload 1</b> PNG image to generate its variation and optionally insert text to specify the change.</p>
    <p><b>Upload 2</b> PNG images where the second is a copy of the first with a transparent area where the edit should
      take place and text to specify the edit.</p>
    <p>Click <a href="https://platform.openai.com/docs/guides/images/introduction">here</a> for more info.</p>`;

  url = ''; // set dynamically
  permittedErrorPrefixes = ['Incorrect', 'Invalid input image'];

  constructor(deepChat: DeepChat) {
    const {directConnection} = deepChat;
    const apiKey = directConnection?.openAI;
    const defaultFile = {images: {files: {acceptedFormats: '.png', maxNumberOfFiles: 2}}};
    super(deepChat, OpenAIUtils.buildKeyVerificationDetails(), OpenAIUtils.buildHeaders, apiKey, defaultFile);
    const config = directConnection?.openAI?.images as NonNullable<OpenAI['images']>;
    if (this.camera) {
      const dimension = typeof config === 'object' && config.size ? Number.parseInt(config.size) : 1024;
      this.camera.files = {dimensions: {width: dimension, height: dimension}};
    }
    if (typeof config === 'object') Object.assign(this.rawBody, config);
    this.canSendMessage = OpenAIImagesIO.canFileSendMessage;
  }

  private static canFileSendMessage(text?: string, files?: File[]) {
    return !!files?.[0] || !!(text && text.trim() !== '');
  }

  private static createFormDataBody(body: OpenAIImages, image: File, mask?: File) {
    const formData = new FormData();
    formData.append('image', image);
    if (mask) formData.append('mask', mask);
    Object.keys(body).forEach((key) => {
      formData.append(key, String(body[key as keyof OpenAIImages]));
    });
    return formData;
  }

  private preprocessBody(body: OpenAIImages, lastMessage?: string) {
    const bodyCopy = JSON.parse(JSON.stringify(body));
    if (lastMessage && lastMessage !== '') bodyCopy.prompt = lastMessage;
    return bodyCopy;
  }

  // prettier-ignore
  private callApiWithImage(messages: Messages, pMessages: MessageContent[], files: File[]) {
    let formData: FormData;
    const lastMessage = pMessages[pMessages.length - 1]?.text?.trim();
    // if there is a mask image or text, call edit
    if (files[1] || (lastMessage && lastMessage !== '')) {
      this.url = OpenAIImagesIO.IMAGE_EDIT_URL;
      const body = this.preprocessBody(this.rawBody, lastMessage);
      formData = OpenAIImagesIO.createFormDataBody(body, files[0], files[1]);
    } else {
      this.url = OpenAIImagesIO.IMAGE_VARIATIONS_URL;
      formData = OpenAIImagesIO.createFormDataBody(this.rawBody, files[0]);
    }
    // need to pass stringifyBody boolean separately as binding is throwing an error for some reason
    RequestUtils.tempRemoveContentHeader(this.requestSettings,
      HTTPRequest.request.bind(this, this, formData, messages), false);
  }

  override async callServiceAPI(messages: Messages, pMessages: MessageContent[], files?: File[]) {
    if (!this.requestSettings?.headers) throw new Error('Request settings have not been set up');
    if (files?.[0]) {
      this.callApiWithImage(messages, pMessages, files);
    } else {
      if (!this.requestSettings) throw new Error('Request settings have not been set up');
      this.url = OpenAIImagesIO.IMAGE_GENERATION_URL;
      const body = this.preprocessBody(this.rawBody, pMessages[pMessages.length - 1].text);
      HTTPRequest.request(this, body, messages);
    }
  }

  override async extractResultData(result: OpenAIImageResult): Promise<Response> {
    if (result.error) throw result.error.message;
    const files = result.data.map((imageData) => {
      if (imageData.url) return {src: imageData.url, type: 'image'};
      return {src: `${BASE_64_PREFIX}${imageData.b64_json}`, type: 'image'};
    }) as MessageFiles;
    return {files};
  }

  // private static readonly MODAL_MARKDOWN = `
  // 1 image:

  // - With text - edits image based on the text
  // - No text - creates a variation of the image

  // 2 images:

  // - The second image needs to be a copy of the first with a transparent area where the edit should take place.
  // Add text to describe the required modification.

  // Click here for [more info](https://platform.openai.com/docs/guides/images/introduction).
  //   `;
}
