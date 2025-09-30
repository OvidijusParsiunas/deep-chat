import {AUTHENTICATION_ERROR_PREFIX, INVALID_REQUEST_ERROR_PREFIX, OBJECT} from '../utils/serviceConstants';
import {TogetherImagesRequestBody} from '../../types/togetherInternal';
import {TogetherImagesResult} from '../../types/togetherResult';
import {DirectConnection} from '../../types/directConnection';
import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {Response as ResponseI} from '../../types/response';
import {DirectServiceIO} from '../utils/directServiceIO';
import {MessageFiles} from '../../types/messageFile';
import {TogetherUtils} from './utils/togetherUtils';
import {TogetherImages} from '../../types/together';
import {APIKey} from '../../types/APIKey';
import {DeepChat} from '../../deepChat';

// https://docs.together.ai/reference/post-images-generations
export class TogetherImagesIO extends DirectServiceIO {
  override insertKeyPlaceholderText = this.genereteAPIKeyName('Together AI');
  override keyHelpUrl = 'https://api.together.xyz/settings/api-keys';
  url = 'https://api.together.xyz/v1/images/generations';
  permittedErrorPrefixes = [INVALID_REQUEST_ERROR_PREFIX, AUTHENTICATION_ERROR_PREFIX];

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = JSON.parse(JSON.stringify(deepChat.directConnection)) as DirectConnection;
    const apiKey = directConnectionCopy.together;
    super(deepChat, TogetherUtils.buildKeyVerificationDetails(), TogetherUtils.buildHeaders, apiKey);
    const config = directConnectionCopy.together?.images as TogetherImages & APIKey;
    if (typeof config === OBJECT) {
      this.cleanConfig(config);
      Object.assign(this.rawBody, config);
    }
    this.rawBody.model ??= 'black-forest-labs/FLUX.1-schnell-Free';
  }

  private cleanConfig(config: TogetherImages & APIKey) {
    delete config.key;
  }

  private preprocessBody(body: TogetherImagesRequestBody, pMessages: MessageContentI[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body)) as TogetherImagesRequestBody;
    const lastMessage = pMessages[pMessages.length - 1];
    bodyCopy.prompt = lastMessage?.text || '';
    return bodyCopy;
  }

  override async callServiceAPI(messages: Messages, pMessages: MessageContentI[]) {
    return this.callDirectServiceServiceAPI(messages, pMessages, this.preprocessBody.bind(this));
  }

  override async extractResultData(result: TogetherImagesResult): Promise<ResponseI> {
    const files = result.data.map((imageData) => {
      if (imageData?.url) {
        return {src: imageData.url, type: 'image'};
      }
      if (imageData?.b64_json) {
        return {src: `data:image/png;base64,${imageData.b64_json}`, type: 'image'};
      }
      return {src: '', type: 'image'};
    }) as MessageFiles;
    return {files};
  }
}
