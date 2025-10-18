import {BIG_MODEL_BUILD_KEY_VERIFICATION_DETAILS, BIG_MODEL_BUILD_HEADERS} from './utils/bigModelUtils';
import {AUTHENTICATION_ERROR_PREFIX, AUTHORIZATION_H, OBJECT} from '../utils/serviceConstants';
import {FILES, IMAGE, IMAGES, SRC, TEXT, TYPE} from '../../utils/consts/messageConstants';
import {BigModelImagesRequestBody} from '../../types/bigModelInternal';
import {BigModelImagesResult} from '../../types/bigModelResult';
import {DirectConnection} from '../../types/directConnection';
import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {Response as ResponseI} from '../../types/response';
import {DirectServiceIO} from '../utils/directServiceIO';
import {MessageFiles} from '../../types/messageFile';
import {BigModelImages} from '../../types/bigModel';
import {APIKey} from '../../types/APIKey';
import {DeepChat} from '../../deepChat';

// https://docs.bigmodel.cn/api-reference/%E6%A8%A1%E5%9E%8B-api/%E5%9B%BE%E5%83%8F%E7%94%9F%E6%88%90
export class BigModelImagesIO extends DirectServiceIO {
  override insertKeyPlaceholderText = this.genereteAPIKeyName('BigModel');
  override keyHelpUrl = 'https://open.bigmodel.cn/usercenter/apikeys';
  url = 'https://open.bigmodel.cn/api/paas/v4/images/generations';
  permittedErrorPrefixes = [AUTHORIZATION_H, AUTHENTICATION_ERROR_PREFIX];

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = JSON.parse(JSON.stringify(deepChat.directConnection)) as DirectConnection;
    const apiKey = directConnectionCopy.bigModel;
    super(deepChat, BIG_MODEL_BUILD_KEY_VERIFICATION_DETAILS(), BIG_MODEL_BUILD_HEADERS, apiKey);
    const config = directConnectionCopy.bigModel?.[IMAGES] as BigModelImages;
    if (typeof config === OBJECT) {
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
    bodyCopy.prompt = lastMessage?.[TEXT] || '';
    return bodyCopy;
  }

  override async callServiceAPI(messages: Messages, pMessages: MessageContentI[]) {
    return this.callDirectServiceServiceAPI(messages, pMessages, this.preprocessBody.bind(this));
  }

  override async extractResultData(result: BigModelImagesResult): Promise<ResponseI> {
    const files = result.data.map((imageData) => {
      if (imageData?.url) {
        return {[SRC]: imageData.url, [TYPE]: IMAGE};
      }
      return {[SRC]: '', [TYPE]: IMAGE};
    }) as MessageFiles;
    return {[FILES]: files};
  }
}
