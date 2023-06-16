import {RequestHeaderUtils} from '../../utils/HTTP/RequestHeaderUtils';
import {CompletionsHandlers, StreamHandlers} from '../serviceIO';
import {BASE_64_PREFIX} from '../../utils/element/imageUtils';
import {IExistingServiceIO} from '../utils/existingServiceIO';
import {Messages} from '../../views/chat/messages/messages';
import {OpenAIImageResult} from '../../types/openAIResult';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {OpenAI, OpenAIImages} from '../../types/openAI';
import {MessageFiles} from '../../types/messageFile';
import {MessageContent} from '../../types/messages';
import {OpenAIUtils} from './utils/openAIUtils';
import {Result} from '../../types/result';
import {DeepChat} from '../../deepChat';

export class OpenAIImagesIO extends IExistingServiceIO {
  override insertKeyPlaceholderText = 'OpenAI API Key';
  override getKeyLink = 'https://platform.openai.com/account/api-keys';
  private static readonly IMAGE_GENERATION_URL = 'https://api.openai.com/v1/images/generations';
  private static readonly IMAGE_VARIATIONS_URL = 'https://api.openai.com/v1/images/variations';
  private static readonly IMAGE_EDIT_URL = 'https://api.openai.com/v1/images/edits';

  introPanelMarkUp = `
    <div style="width: 100%; text-align: center; margin-left: -10px"><b>OpenAI Images</b></div>
    <p><b>Insert text</b> to generate an image.</p>
    <p><b>Upload 1</b> image to generate its variation and optionally insert text to specify the change.</p>
    <p><b>Upload 2</b> images where the second is a copy of the first with a transparent area where the edit should
      take place and text to specify the edit.</p>
    <p>Click <a href="https://platform.openai.com/docs/guides/images/introduction">here</a> for more info.</p>`;

  url = ''; // set dynamically
  permittedErrorPrefixes = ['Invalid input image'];
  private readonly _maxCharLength: number = OpenAIUtils.FILE_MAX_CHAR_LENGTH;

  constructor(deepChat: DeepChat) {
    const {existingService, textInput, validateMessageBeforeSending} = deepChat;
    const apiKey = existingService?.openAI;
    const defaultFile = {images: {files: {acceptedFormats: 'png', maxNumberOfFiles: 2}}};
    super(deepChat, OpenAIUtils.buildKeyVerificationDetails(), OpenAIUtils.buildHeaders, apiKey, defaultFile);
    if (textInput?.characterLimit) this._maxCharLength = textInput.characterLimit;
    const config = existingService?.openAI?.images as NonNullable<OpenAI['images']>;
    if (this.camera) {
      const dimension = typeof config === 'object' && config.size ? Number.parseInt(config.size) : 1024;
      this.camera.files = {dimensions: {width: dimension, height: dimension}};
    }
    if (typeof config === 'object') Object.assign(this.rawBody, config);
    this.canSendMessage = validateMessageBeforeSending || OpenAIImagesIO.canFileSendMessage;
  }

  private static canFileSendMessage(text: string, files?: File[]) {
    return !!files?.[0] || text.trim() !== '';
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
    if (lastMessage && lastMessage !== '') {
      const processedMessage = lastMessage.substring(0, this._maxCharLength);
      bodyCopy.prompt = processedMessage;
    }
    return bodyCopy;
  }

  // prettier-ignore
  private callApiWithImage(messages: Messages, pMessages: MessageContent[],
      completionsHandlers: CompletionsHandlers, files: File[]) {
    let formData: FormData;
    const lastMessage = pMessages[pMessages.length - files.length + 1]?.text?.trim();
    // if there is a mask image or text, call edit
    if (files[1] || (lastMessage && lastMessage !== '')) {
      this.url = this.requestSettings?.url || OpenAIImagesIO.IMAGE_EDIT_URL;
      const body = this.preprocessBody(this.rawBody, lastMessage);
      formData = OpenAIImagesIO.createFormDataBody(body, files[0], files[1]);
    } else {
      this.url = this.requestSettings?.url || OpenAIImagesIO.IMAGE_VARIATIONS_URL;
      formData = OpenAIImagesIO.createFormDataBody(this.rawBody, files[0]);
    }
    // need to pass stringifyBody boolean separately as binding is throwing an error for some reason
    RequestHeaderUtils.temporarilyRemoveContentType(this.requestSettings,
      HTTPRequest.request.bind(this, this, formData, messages, completionsHandlers.onFinish), false);
  }

  // prettier-ignore
  override callServiceAPI(messages: Messages, pMessages: MessageContent[],
      completionsHandlers: CompletionsHandlers, _: StreamHandlers, files?: File[]) {
    if (!this.requestSettings?.headers) throw new Error('Request settings have not been set up');
    if (files?.[0]) {
      this.callApiWithImage(messages, pMessages, completionsHandlers, files);
    } else {
      if (!this.requestSettings) throw new Error('Request settings have not been set up');
      this.url = this.requestSettings.url || OpenAIImagesIO.IMAGE_GENERATION_URL;
      const body = this.preprocessBody(this.rawBody, pMessages[pMessages.length - 1].text);
      HTTPRequest.request(this, body, messages, completionsHandlers.onFinish);
    }
  }

  override async extractResultData(result: OpenAIImageResult): Promise<Result> {
    if (result.error) throw result.error.message;
    const files = result.data.map((imageData) => {
      if (imageData.url) return {src: imageData.url, type: 'image'};
      return {base64: `${BASE_64_PREFIX}${imageData.b64_json}`, type: 'image'};
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
