import {CameraFilesServiceConfig, FilesServiceConfig} from '../../types/fileServiceConfigs';
import {RemarkableConfig} from '../../views/chat/messages/remarkable/remarkableConfig';
import {ValidateMessageBeforeSending} from '../../types/validateMessageBeforeSending';
import {RequestInterceptor, ResponseInterceptor} from '../../types/interceptors';
import {RequestHeaderUtils} from '../../utils/HTTP/RequestHeaderUtils';
import {ExistingServiceCameraConfig} from '../../types/camera';
import {OpenAI, OpenAIImagesConfig} from '../../types/openAI';
import {BASE_64_PREFIX} from '../../utils/element/imageUtils';
import {Messages} from '../../views/chat/messages/messages';
import {RequestSettings} from '../../types/requestSettings';
import {FileAttachments} from '../../types/fileAttachments';
import {OpenAIImageResult} from '../../types/openAIResult';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {MessageFiles} from '../../types/messageFile';
import {CameraFiles} from '../../types/cameraFiles';
import {GenericButton} from '../../types/button';
import {OpenAIUtils} from './utils/openAIUtils';
import {AiAssistant} from '../../aiAssistant';
import {Result} from '../../types/result';
import {Remarkable} from 'remarkable';
import {
  KeyVerificationHandlers,
  CompletionsHandlers,
  ServiceFileTypes,
  StreamHandlers,
  FileServiceIO,
  ServiceIO,
} from '../serviceIO';

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
  fileTypes: ServiceFileTypes = {images: {files: {acceptedFormats: '.png', maxNumberOfFiles: 2}}};
  camera?: CameraFilesServiceConfig;
  private readonly _maxCharLength: number = OpenAIUtils.FILE_MAX_CHAR_LENGTH;
  requestSettings: RequestSettings = {};
  private readonly _raw_body: OpenAIImagesConfig = {};
  requestInterceptor: RequestInterceptor = (details) => details;
  resposeInterceptor: ResponseInterceptor = (result) => result;

  constructor(aiAssistant: AiAssistant, key?: string) {
    const {openAI, inputCharacterLimit, validateMessageBeforeSending} = aiAssistant;
    if (inputCharacterLimit) this._maxCharLength = inputCharacterLimit;
    const config = openAI?.images as OpenAI['images'];
    const requestSettings = (typeof config === 'object' ? config.request : undefined) || {};
    if (key) this.requestSettings = key ? OpenAIUtils.buildRequestSettings(key, requestSettings) : requestSettings;
    const remarkable = RemarkableConfig.createNew();
    if (config && typeof config !== 'boolean' && this.fileTypes.images) {
      OpenAIImagesIO.processImagesConfig(this.fileTypes.images, remarkable, config.files, config.button);
      if (config.requestInterceptor) this.requestInterceptor = config.requestInterceptor;
      if (config.responseInterceptor) this.resposeInterceptor = config.responseInterceptor;
      if (config.camera) this.camera = OpenAIImagesIO.processCameraConfig(config.camera, config);
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
    }
    _images.button = button;
  }

  private static processCameraConfig(camera: ExistingServiceCameraConfig['camera'], images: OpenAIImagesConfig) {
    const cameraConfig: CameraFilesServiceConfig & {files: CameraFiles} = {files: {}};
    if (typeof camera === 'object') {
      cameraConfig.button = camera.button;
      cameraConfig.modalContainerStyle = camera.modalContainerStyle;
      // cameraConfig.files.newFilePrefix = camera.newFilePrefix; // can implement in the future
      const dimension = images.size ? Number.parseInt(images.size) : undefined;
      cameraConfig.files = {dimensions: {width: dimension || 1024, height: dimension || 1024}}; // 1024x1024 is the default
    }
    return cameraConfig;
  }

  private static cleanConfig(config: FilesServiceConfig & ExistingServiceCameraConfig) {
    delete config.files;
    delete config.button;
    delete config.request;
    delete config.camera;
    delete config.requestInterceptor;
    delete config.responseInterceptor;
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

  private preprocessBody(body: OpenAIImagesConfig, lastMessage?: string) {
    const bodyCopy = JSON.parse(JSON.stringify(body));
    if (lastMessage && lastMessage !== '') {
      const processedMessage = lastMessage.substring(0, this._maxCharLength);
      bodyCopy.prompt = processedMessage;
    }
    return bodyCopy;
  }

  // prettier-ignore
  private callApiWithImage(messages: Messages, completionsHandlers: CompletionsHandlers, files: File[]) {
    let formData: FormData;
    const lastMessage = messages.messages[messages.messages.length - files.length + 1]?.text?.trim();
    // if there is a mask image or text, call edit
    if (files[1] || (lastMessage && lastMessage !== '')) {
      this.url = this.requestSettings.url || OpenAIImagesIO.IMAGE_EDIT_URL;
      const body = this.preprocessBody(this._raw_body, lastMessage);
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
      const body = this.preprocessBody(this._raw_body, messages.messages[messages.messages.length - 1].text);
      HTTPRequest.request(this, body, messages, completionsHandlers.onFinish);
    }
  }

  extractResultData(result: OpenAIImageResult): Result {
    if (result.error) throw result.error.message;
    const files = result.data.map((imageData) => {
      if (imageData.url) return {url: imageData.url, type: 'image'};
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
