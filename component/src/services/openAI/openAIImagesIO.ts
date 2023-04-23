import {CompletionsHandlers, FileServiceIO, KeyVerificationHandlers, ServiceIO, StreamHandlers} from '../serviceIO';
import {RemarkableConfig} from '../../views/chat/messages/remarkable/remarkableConfig';
import {ValidateMessageBeforeSending} from '../../types/validateMessageBeforeSending';
import {RequestHeaderUtils} from '../../utils/HTTP/RequestHeaderUtils';
import {RequestInterceptor} from '../../types/requestInterceptor';
import {OpenAI, OpenAIImagesConfig} from '../../types/openAI';
import {BASE_64_PREFIX} from '../../utils/element/imageUtils';
import {Messages} from '../../views/chat/messages/messages';
import {RequestSettings} from '../../types/requestSettings';
import {FileAttachments} from '../../types/fileAttachments';
import {OpenAIImageResult} from '../../types/openAIResult';
import {FilesServiceConfig} from '../../types/fileService';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {MessageContent} from '../../types/messages';
import {FileResults} from '../../types/fileResult';
import {GenericButton} from '../../types/button';
import {OpenAIUtils} from './utils/openAIUtils';
import {AiAssistant} from '../../aiAssistant';
import {Remarkable} from 'remarkable';

export class OpenAIImagesIO implements ServiceIO {
  private static readonly IMAGE_GENERATION_URL = 'https://api.openai.com/v1/images/generations';
  private static readonly IMAGE_VARIATIONS_URL = 'https://api.openai.com/v1/images/variations';
  private static readonly IMAGE_EDIT_URL = 'https://api.openai.com/v1/images/edits';

  // TO-DO mention in documentation that this can be removed by inserting <div></div> in slot
  introPanelMarkUp = `
    <div style="width: 100%; text-align: center; margin-left: -10px"><b>OpenAI Images</b></div>
    <p><b>Insert text</b> to generate an image.</p>
    <p><b>Upload 1</b> image to generate a variation and optionally insert text to specify the change.</p>
    <p><b>Upload 2</b> images where the second is a copy of the first with a transparent area where the edit should
      take place and text to specify the edit.</p>
    <p>Click <a href="https://platform.openai.com/docs/guides/images/introduction">here</a> for more info.</p>`;

  url = ''; // set dynamically
  canSendMessage: ValidateMessageBeforeSending = OpenAIImagesIO.canSendMessage;
  permittedErrorPrefixes = new Set('Invalid input image');
  images: FileServiceIO = {
    files: {acceptedFormats: '.png', maxNumberOfFiles: 2, dragAndDrop: {acceptedFileNamePostfixes: ['png']}},
  };
  private readonly _maxCharLength: number = OpenAIUtils.FILE_MAX_CHAR_LENGTH;
  requestSettings: RequestSettings = {};
  private readonly _raw_body: OpenAIImagesConfig = {};
  requestInterceptor: RequestInterceptor = (details) => details;

  constructor(aiAssistant: AiAssistant, key?: string) {
    const {openAI, inputCharacterLimit, validateMessageBeforeSending} = aiAssistant;
    if (inputCharacterLimit) this._maxCharLength = inputCharacterLimit;
    const config = openAI?.images as OpenAI['images'];
    const requestSettings = (typeof config === 'object' ? config.request : undefined) || {};
    if (key) this.requestSettings = key ? OpenAIUtils.buildRequestSettings(key, requestSettings) : requestSettings;
    const remarkable = RemarkableConfig.createNew();
    if (config && typeof config !== 'boolean') {
      OpenAIImagesIO.processImagesConfig(this.images, remarkable, config.files, config.button);
      if (config.interceptor) this.requestInterceptor = config.interceptor;
      OpenAIImagesIO.cleanConfig(config);
      this._raw_body = config;
    }
    if (validateMessageBeforeSending) this.canSendMessage = validateMessageBeforeSending;
  }

  private static canSendMessage(text: string, files?: File[]) {
    return !!files?.[0] || text.trim() !== '';
  }

  // prettier-ignore
  private static processImagesConfig(_images: FileServiceIO, remarkable: Remarkable, files?: FileAttachments,
      button?: GenericButton) {
    if (files && _images.files) {
      if (_images.files.infoModal) {
        Object.assign(_images.files.infoModal, files.infoModal);
        const markdown = files.infoModal?.textMarkDown;
        _images.infoModalTextMarkUp = remarkable.render(markdown || '');
      }
      if (files.acceptedFormats) _images.files.acceptedFormats = files.acceptedFormats;
      if (files.maxNumberOfFiles) _images.files.maxNumberOfFiles = files.maxNumberOfFiles;
      if (typeof files.dragAndDrop !== undefined) _images.files.dragAndDrop = files.dragAndDrop;
    }
    if (button) {
      _images.button = button;
      if (_images.button.styles) _images.button.default = _images.button.styles;
    }
  }

  private static cleanConfig(config: FilesServiceConfig) {
    delete config.files;
    delete config.button;
    delete config.request;
    delete config.interceptor;
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

  extractResultData(result: OpenAIImageResult): FileResults {
    if (result.error) throw result.error.message;
    return result.data.map((imageData) => {
      if (imageData.url) return imageData;
      return {base64: `${BASE_64_PREFIX}${imageData.b64_json}`};
    }) as FileResults;
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
