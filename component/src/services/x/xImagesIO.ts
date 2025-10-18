import {AUTHENTICATION_ERROR_PREFIX, INVALID_REQUEST_ERROR_PREFIX, OBJECT} from '../utils/serviceConstants';
import {ERROR, FILES, IMAGE, IMAGES, SRC, TEXT, TYPE} from '../../utils/consts/messageConstants';
import {X_BUILD_HEADERS, X_BUILD_KEY_VERIFICATION_DETAILS} from './utils/xUtils';
import {BASE_64_PREFIX} from '../../utils/element/imageUtils';
import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {DirectServiceIO} from '../utils/directServiceIO';
import {MessageFiles} from '../../types/messageFile';
import {XImageResult} from '../../types/xResult';
import {Response} from '../../types/response';
import {DeepChat} from '../../deepChat';
import {XImages} from '../../types/x';

export class XImagesIO extends DirectServiceIO {
  override insertKeyPlaceholderText = this.genereteAPIKeyName('X');
  override keyHelpUrl = 'https://console.x.ai/team/default/api-keys';
  private static readonly IMAGE_GENERATION_URL = 'https://api.x.ai/v1/images/generations';

  url = XImagesIO.IMAGE_GENERATION_URL;
  permittedErrorPrefixes = [INVALID_REQUEST_ERROR_PREFIX, AUTHENTICATION_ERROR_PREFIX];

  constructor(deepChat: DeepChat) {
    const {directConnection} = deepChat;
    const apiKey = directConnection?.x;
    super(deepChat, X_BUILD_KEY_VERIFICATION_DETAILS(), X_BUILD_HEADERS, apiKey);
    const config = directConnection?.x?.[IMAGES] as NonNullable<XImages>;
    if (typeof config === OBJECT) Object.assign(this.rawBody, config);
    this.rawBody.model ??= 'grok-2-image';
  }

  private preprocessBody(body: XImages, messages: MessageContentI[]) {
    const lastMessage = messages[messages.length - 1][TEXT];
    const bodyCopy = JSON.parse(JSON.stringify(body));
    if (lastMessage && lastMessage !== '') bodyCopy.prompt = lastMessage;
    return bodyCopy;
  }

  override async callServiceAPI(messages: Messages, pMessages: MessageContentI[]) {
    this.callDirectServiceServiceAPI(messages, pMessages, this.preprocessBody.bind(this));
  }

  override async extractResultData(result: XImageResult): Promise<Response> {
    if (result[ERROR]) throw result[ERROR].message;
    const files = result.data.map((imageData) => {
      if (imageData.url) return {[SRC]: imageData.url, [TYPE]: IMAGE};
      return {[SRC]: `${BASE_64_PREFIX}${imageData.b64_json}`, [TYPE]: IMAGE};
    }) as MessageFiles;
    return {[FILES]: files};
  }
}
