import {CompletionsHandlers, KeyVerificationHandlers, ServiceIO, StreamHandlers} from '../serviceIO';
import {RemarkableConfig} from '../../views/chat/messages/remarkable/remarkableConfig';
import {ValidateMessageBeforeSending} from '../../types/validateMessageBeforeSending';
import {RequestHeaderUtils} from '../../utils/HTTP/RequestHeaderUtils';
import {RequestInterceptor} from '../../types/requestInterceptor';
import {OpenAI, OpenAIImagesConfig} from '../../types/openAI';
import {BASE_64_PREFIX} from '../../utils/element/imageUtils';
import {Messages} from '../../views/chat/messages/messages';
import {RequestSettings} from '../../types/requestSettings';
import {OpenAIImageResult} from '../../types/openAIResult';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {ImageResults} from '../../types/imageResult';
import {MessageContent} from '../../types/messages';
import {OpenAIUtils} from './utils/openAIUtils';
import {AiAssistant} from '../../aiAssistant';

export class OpenAIImagesIO implements ServiceIO {
  private static readonly IMAGE_GENERATION_URL = 'https://api.openai.com/v1/images/generations';
  private static readonly IMAGE_VARIATIONS_URL = 'https://api.openai.com/v1/images/variations';
  private static readonly IMAGE_EDIT_URL = 'https://api.openai.com/v1/images/edits';
  private static readonly MODAL_MARKDOWN = `
1 image:

- With text - edits image based on the text
- No text - creates a variation of the image

2 images:

- The second image needs to be a copy of the first with a transparent area where the edit should take place.
Add text to describe the required modification.

Click here for [more info](https://platform.openai.com/docs/guides/images/introduction).
  `;

  url = ''; // set dynamically
  canSendMessage: ValidateMessageBeforeSending = OpenAIImagesIO.canSendMessage;
  allowImages: ServiceIO['allowImages'] = {acceptedFormats: '.png', maxNumberOfFiles: 2, openModalOnce: true};
  private readonly _maxCharLength: number = OpenAIUtils.IMAGES_MAX_CHAR_LENGTH;
  requestSettings: RequestSettings = {};
  private readonly _raw_body: OpenAIImagesConfig = {};
  requestInterceptor: RequestInterceptor;

  constructor(aiAssistant: AiAssistant, key?: string) {
    const {openAI, requestInterceptor, requestSettings, inputCharacterLimit, validateMessageBeforeSending} = aiAssistant;
    if (inputCharacterLimit) this._maxCharLength = inputCharacterLimit;
    if (key) this.requestSettings = OpenAIUtils.buildRequestSettings(key, requestSettings);
    this.requestInterceptor = requestInterceptor || ((details) => details);
    const config = openAI?.completions as OpenAI['images'];
    if (config && typeof config !== 'boolean') this._raw_body = config;
    if (validateMessageBeforeSending) this.canSendMessage = validateMessageBeforeSending;
    if (typeof this.allowImages === 'object') {
      const remarkable = RemarkableConfig.createNew();
      this.allowImages.modalTextMarkUp = remarkable.render(OpenAIImagesIO.MODAL_MARKDOWN);
    }
  }

  private static canSendMessage(text: string, files?: File[]) {
    return !!files?.[0] || text.trim() !== '';
  }

  private addKey(onSuccess: (key: string) => void, key: string) {
    this.requestSettings = OpenAIUtils.buildRequestSettings(key, this.requestSettings);
    onSuccess(key);
  }

  // prettier-ignore
  verifyKey(inputElement: HTMLInputElement, keyVerificationHandlers: KeyVerificationHandlers) {
    OpenAIUtils.verifyKey(inputElement, this.addKey.bind(this, keyVerificationHandlers.onSuccess),
      keyVerificationHandlers.onFail, keyVerificationHandlers.onLoad);
  }

  private static createFormDataBody(body: OpenAIImagesConfig, image: File, mask?: File) {
    const formData = new FormData();
    formData.append('image', image);
    if (mask) formData.append('mask', mask);
    Object.keys(body).forEach((key) => {
      formData.append(key, String(body[key as keyof OpenAIImagesConfig]));
    });
    return formData;
  }

  private preprocessBody(body: OpenAIImagesConfig, messages: MessageContent[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body));
    if (messages[messages.length - 1].content.trim() !== '') {
      const mostRecentMessageText = messages[messages.length - 1].content;
      const processedMessage = mostRecentMessageText.substring(0, this._maxCharLength);
      bodyCopy.prompt = processedMessage;
    }
    return bodyCopy;
  }

  // WORK - ability to add images one after another
  // prettier-ignore
  private callApiWithImage(messages: Messages, completionsHandlers: CompletionsHandlers, files: File[]) {
    let formData: FormData;
    // if there is a mask image or text, call edit
    if (files[1] || messages.messages[messages.messages.length - 1].content.trim() !== '') {
      this.url = this.requestSettings.url || OpenAIImagesIO.IMAGE_EDIT_URL;
      const body = this.preprocessBody(this._raw_body, messages.messages);
      formData = OpenAIImagesIO.createFormDataBody(body, files[0], files[1]);
    } else {
      this.url = this.requestSettings.url || OpenAIImagesIO.IMAGE_VARIATIONS_URL;
      formData = OpenAIImagesIO.createFormDataBody(this._raw_body, files[0]);
    }
    // need to pass stringifyBody boolean separately as binding is throwing an error for some reason
    RequestHeaderUtils.temporarilyRemoveContentType(this.requestSettings,
      HTTPRequest.request.bind(this, this, formData, messages, completionsHandlers.onFinish), false);
  }

  callApi(messages: Messages, completionsHandlers: CompletionsHandlers, _: StreamHandlers, files?: File[]) {
    if (!this.requestSettings?.headers) throw new Error('Request settings have not been set up');
    if (files?.[0]) {
      this.callApiWithImage(messages, completionsHandlers, files);
    } else {
      if (!this.requestSettings) throw new Error('Request settings have not been set up');
      this.url = this.requestSettings.url || OpenAIImagesIO.IMAGE_GENERATION_URL;
      const body = this.preprocessBody(this._raw_body, messages.messages);
      HTTPRequest.request(this, body, messages, completionsHandlers.onFinish);
    }
  }

  extractResultData(result: OpenAIImageResult): ImageResults {
    if (result.error) throw result.error.message;
    return result.data.map((imageData) => {
      if (imageData.url) return imageData;
      return {base64: `${BASE_64_PREFIX}${imageData.b64_json}`};
    }) as ImageResults;
  }
}
