import {CAMERA, ERROR, FILES, IMAGE, IMAGES, SRC, TEXT, TYPE} from '../../utils/consts/messageConstants';
import {OPEN_AI_BUILD_HEADERS, OPEN_AI_BUILD_KEY_VERIFICATION_DETAILS} from './utils/openAIUtils';
import {OpenAI, OpenAIImagesDalle2, OpenAIImagesDalle3} from '../../types/openAI';
import {REQUEST_SETTINGS_ERROR} from '../../utils/errorMessages/errorMessages';
import {INCORRECT_ERROR_PREFIX, OBJECT} from '../utils/serviceConstants';
import {OPEN_AI_BASE_URL, OPEN_AI_KEY_HELP_URL} from './openAIConsts';
import {BASE_64_PREFIX} from '../../utils/element/imageUtils';
import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {RequestUtils} from '../../utils/HTTP/requestUtils';
import {OpenAIImageResult} from '../../types/openAIResult';
import {DirectServiceIO} from '../utils/directServiceIO';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {MessageFiles} from '../../types/messageFile';
import {Response} from '../../types/response';
import {DeepChat} from '../../deepChat';

type OpenAIImagesDalle = OpenAIImagesDalle2 | OpenAIImagesDalle3;

export class OpenAIImagesIO extends DirectServiceIO {
  override insertKeyPlaceholderText = this.genereteAPIKeyName('OpenAI');
  override keyHelpUrl = OPEN_AI_KEY_HELP_URL;
  private static readonly IMAGE_GENERATION_URL = `${OPEN_AI_BASE_URL}images/generations`;
  private static readonly IMAGE_VARIATIONS_URL = `${OPEN_AI_BASE_URL}images/variations`;
  private static readonly IMAGE_EDIT_URL = `${OPEN_AI_BASE_URL}images/edits`;
  url = ''; // set dynamically
  permittedErrorPrefixes = [INCORRECT_ERROR_PREFIX, 'Invalid input image'];

  constructor(deepChat: DeepChat) {
    const {directConnection} = deepChat;
    const apiKey = directConnection?.openAI;
    const defaultFile = {images: {[FILES]: {acceptedFormats: '.png', maxNumberOfFiles: 2}}};
    super(deepChat, OPEN_AI_BUILD_KEY_VERIFICATION_DETAILS(), OPEN_AI_BUILD_HEADERS, apiKey, defaultFile);
    const config = directConnection?.openAI?.[IMAGES] as NonNullable<OpenAI['images']>;
    if (this[CAMERA]) {
      const dimension = typeof config === 'object' && config.size ? Number.parseInt(config.size) : 1024;
      this[CAMERA][FILES] = {dimensions: {width: dimension, height: dimension}};
    }
    if (typeof config === OBJECT) Object.assign(this.rawBody, config);
    this.canSendMessage = OpenAIImagesIO.canFileSendMessage;
  }

  private static canFileSendMessage(text?: string, files?: File[]) {
    return !!files?.[0] || !!(text && text.trim() !== '');
  }

  private static createFormDataBody(body: OpenAIImagesDalle, image: File, mask?: File) {
    const formData = new FormData();
    formData.append(IMAGE, image);
    if (mask) formData.append('mask', mask);
    Object.keys(body).forEach((key) => {
      formData.append(key, String(body[key as keyof OpenAIImagesDalle]));
    });
    return formData;
  }

  private preprocessBody(body: OpenAIImagesDalle, lastMessage?: string) {
    const bodyCopy = JSON.parse(JSON.stringify(body));
    if (lastMessage && lastMessage !== '') bodyCopy.prompt = lastMessage;
    return bodyCopy;
  }

  // prettier-ignore
  private callApiWithImage(messages: Messages, pMessages: MessageContentI[], files: File[]) {
    let formData: FormData;
    const lastMessage = pMessages[pMessages.length - 1]?.[TEXT]?.trim();
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
    RequestUtils.tempRemoveContentHeader(this.connectSettings,
      HTTPRequest.request.bind(this, this, formData, messages), false);
  }

  override async callServiceAPI(messages: Messages, pMessages: MessageContentI[], files?: File[]) {
    if (!this.connectSettings?.headers) throw new Error(REQUEST_SETTINGS_ERROR);
    if (files?.[0]) {
      this.callApiWithImage(messages, pMessages, files);
    } else {
      if (!this.connectSettings) throw new Error(REQUEST_SETTINGS_ERROR);
      this.url = OpenAIImagesIO.IMAGE_GENERATION_URL;
      const body = this.preprocessBody(this.rawBody, pMessages[pMessages.length - 1][TEXT]);
      HTTPRequest.request(this, body, messages);
    }
  }

  override async extractResultData(result: OpenAIImageResult): Promise<Response> {
    if (result[ERROR]) throw result[ERROR].message;
    const files = result.data.map((imageData) => {
      if (imageData.url) return {[SRC]: imageData.url, [TYPE]: IMAGE};
      return {[SRC]: `${BASE_64_PREFIX}${imageData.b64_json}`, [TYPE]: IMAGE};
    }) as MessageFiles;
    return {[FILES]: files};
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
