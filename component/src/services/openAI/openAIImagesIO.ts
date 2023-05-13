import {RequestHeaderUtils} from '../../utils/HTTP/RequestHeaderUtils';
import {CompletionsHandlers, StreamHandlers} from '../serviceIO';
import {ExistingServiceCameraConfig} from '../../types/camera';
import {OpenAI, OpenAIImagesConfig} from '../../types/openAI';
import {BASE_64_PREFIX} from '../../utils/element/imageUtils';
import {Messages} from '../../views/chat/messages/messages';
import {OpenAIImageResult} from '../../types/openAIResult';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {MessageFiles} from '../../types/messageFile';
import {BaseServideIO} from '../utils/baseServiceIO';
import {OpenAIUtils} from './utils/openAIUtils';
import {AiAssistant} from '../../aiAssistant';
import {Result} from '../../types/result';

export class OpenAIImagesIO extends BaseServideIO {
  override insertKeyPlaceholderText = 'OpenAI API Key';
  override getKeyLink = 'https://platform.openai.com/account/api-keys';
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
  permittedErrorPrefixes = new Set('Invalid input image');
  private readonly _maxCharLength: number = OpenAIUtils.FILE_MAX_CHAR_LENGTH;
  private readonly _raw_body: OpenAIImagesConfig = {};

  constructor(aiAssistant: AiAssistant, key?: string) {
    const {service, inputCharacterLimit, validateMessageBeforeSending} = aiAssistant;
    const config = service?.openAI?.images as NonNullable<OpenAI['images']>;
    super(aiAssistant, OpenAIUtils.buildKeyVerificationDetails(), OpenAIUtils.buildHeaders, config, key, 'images');
    if (inputCharacterLimit) this._maxCharLength = inputCharacterLimit;
    const files = this.fileTypes?.images?.files;
    if (files) {
      if (typeof config === 'boolean' || !config.files?.maxNumberOfFiles) files.maxNumberOfFiles = 2;
      if (typeof config === 'boolean' || !config.files?.acceptedFormats) files.acceptedFormats = 'png';
    }
    if (this.camera) {
      const dimension = typeof config === 'object' && config.size ? Number.parseInt(config.size) : 1024;
      this.camera.files = {dimensions: {width: dimension, height: dimension}};
    }
    if (typeof config === 'object') {
      OpenAIImagesIO.cleanConfig(config);
      this._raw_body = config;
    }
    this.canSendMessage = validateMessageBeforeSending || OpenAIImagesIO.canFileSendMessage;
  }

  private static canFileSendMessage(text: string, files?: File[]) {
    return !!files?.[0] || text.trim() !== '';
  }

  private static cleanConfig(config: ExistingServiceCameraConfig) {
    delete config.files;
    delete config.button;
    delete config.camera;
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
      this.url = this.requestSettings?.url || OpenAIImagesIO.IMAGE_EDIT_URL;
      const body = this.preprocessBody(this._raw_body, lastMessage);
      formData = OpenAIImagesIO.createFormDataBody(body, files[0], files[1]);
    } else {
      this.url = this.requestSettings?.url || OpenAIImagesIO.IMAGE_VARIATIONS_URL;
      formData = OpenAIImagesIO.createFormDataBody(this._raw_body, files[0]);
    }
    // need to pass stringifyBody boolean separately as binding is throwing an error for some reason
    RequestHeaderUtils.temporarilyRemoveContentType(this.requestSettings,
      HTTPRequest.request.bind(this, this, formData, messages, completionsHandlers.onFinish), false);
  }

  override callApi(messages: Messages, completionsHandlers: CompletionsHandlers, _: StreamHandlers, files?: File[]) {
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

  async extractResultData(result: OpenAIImageResult): Promise<Result> {
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
