import {BigModelImagesRequestBody} from '../../types/bigModelInternal';
import {BigModelImagesResult} from '../../types/bigModelResult';
import {DirectConnection} from '../../types/directConnection';
import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {Response as ResponseI} from '../../types/response';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {DirectServiceIO} from '../utils/directServiceIO';
import {MessageFiles} from '../../types/messageFile';
import {BigModelUtils} from './utils/bigModelUtils';
import {BigModelImages} from '../../types/bigModel';
import {APIKey} from '../../types/APIKey';
import {DeepChat} from '../../deepChat';

// https://docs.bigmodel.cn/api-reference/%E6%A8%A1%E5%9E%8B-api/%E5%9B%BE%E5%83%8F%E7%94%9F%E6%88%90
export class BigModelImagesIO extends DirectServiceIO {
  override insertKeyPlaceholderText = 'BigModel API Key';
  override keyHelpUrl = 'https://open.bigmodel.cn/usercenter/apikeys';
  url = 'https://open.bigmodel.cn/api/paas/v4/images/generations';
  permittedErrorPrefixes = ['Authorization', 'authentication_error'];

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = JSON.parse(JSON.stringify(deepChat.directConnection)) as DirectConnection;
    const apiKey = directConnectionCopy.bigModel;
    super(deepChat, BigModelUtils.buildKeyVerificationDetails(), BigModelUtils.buildHeaders, apiKey);
    const config = directConnectionCopy.bigModel?.images;
    if (typeof config === 'object') {
      this.cleanConfig(config);
      Object.assign(this.rawBody, config);
    }
    this.rawBody.model ??= 'cogview-4-250304';
  }

  private cleanConfig(config: BigModelImages & APIKey) {
    delete config.key;
  }

  private preprocessBody(body: BigModelImagesRequestBody, pMessages: MessageContentI[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body)) as BigModelImagesRequestBody;
    const lastMessage = pMessages[pMessages.length - 1];
    bodyCopy.prompt = lastMessage?.text || '';
    return bodyCopy;
  }

  override async callServiceAPI(messages: Messages, pMessages: MessageContentI[]) {
    if (!this.connectSettings) throw new Error('Request settings have not been set up');
    const body = this.preprocessBody(this.rawBody, pMessages);
    return await HTTPRequest.request(this, body, messages);
  }

  override async extractResultData(result: BigModelImagesResult): Promise<ResponseI> {
    const files = result.data.map((imageData) => {
      if (imageData?.url) {
        return {src: imageData.url, type: 'image'};
      }
      return {src: '', type: 'image'};
    }) as MessageFiles;
    return {files};
  }
}
