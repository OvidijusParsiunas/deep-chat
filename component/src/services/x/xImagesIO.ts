import {AUTHENTICATION_ERROR_PREFIX, INVALID_REQUEST_ERROR_PREFIX, OBJECT} from '../utils/serviceConstants';
import {ErrorMessages} from '../../utils/errorMessages/errorMessages';
import {BASE_64_PREFIX} from '../../utils/element/imageUtils';
import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {DirectServiceIO} from '../utils/directServiceIO';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {MessageFiles} from '../../types/messageFile';
import {XImageResult} from '../../types/xResult';
import {Response} from '../../types/response';
import {DeepChat} from '../../deepChat';
import {XImages} from '../../types/x';
import {XUtils} from './utils/xUtils';

export class XImagesIO extends DirectServiceIO {
  override insertKeyPlaceholderText = this.genereteAPIKeyName('X');
  override keyHelpUrl = 'https://console.x.ai/team/default/api-keys';
  private static readonly IMAGE_GENERATION_URL = 'https://api.x.ai/v1/images/generations';

  introPanelMarkUp = `
    <div style="width: 100%; text-align: center; margin-left: -10px"><b>X Image Generation</b></div>
    <p><b>Insert text</b> to generate an image.</p>
    <p>Click <a target="_blank" href="https://docs.x.ai/docs/api-reference#image-generations" target="_blank">
      here</a> for more info.</p>`;

  url = XImagesIO.IMAGE_GENERATION_URL;
  permittedErrorPrefixes = [INVALID_REQUEST_ERROR_PREFIX, AUTHENTICATION_ERROR_PREFIX];

  constructor(deepChat: DeepChat) {
    const {directConnection} = deepChat;
    const apiKey = directConnection?.x;
    super(deepChat, XUtils.buildKeyVerificationDetails(), XUtils.buildHeaders, apiKey);
    const config = directConnection?.x?.images as NonNullable<XImages>;
    if (typeof config === OBJECT) Object.assign(this.rawBody, config);
    this.rawBody.model ??= 'grok-2-image';
  }

  private preprocessBody(body: XImages, lastMessage?: string) {
    const bodyCopy = JSON.parse(JSON.stringify(body));
    if (lastMessage && lastMessage !== '') bodyCopy.prompt = lastMessage;
    return bodyCopy;
  }

  override async callServiceAPI(messages: Messages, pMessages: MessageContentI[]) {
    if (!this.connectSettings?.headers) throw new Error(ErrorMessages.REQUEST_SETTINGS_ERROR);
    const body = this.preprocessBody(this.rawBody, pMessages[pMessages.length - 1].text);
    HTTPRequest.request(this, body, messages);
  }

  override async extractResultData(result: XImageResult): Promise<Response> {
    if (result.error) throw result.error.message;
    const files = result.data.map((imageData) => {
      if (imageData.url) return {src: imageData.url, type: 'image'};
      return {src: `${BASE_64_PREFIX}${imageData.b64_json}`, type: 'image'};
    }) as MessageFiles;
    return {files};
  }
}
