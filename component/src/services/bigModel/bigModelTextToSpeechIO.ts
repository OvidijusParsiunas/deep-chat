import {BIG_MODEL_BUILD_KEY_VERIFICATION_DETAILS, BIG_MODEL_BUILD_HEADERS} from './utils/bigModelUtils';
import {AUTHENTICATION_ERROR_PREFIX, AUTHORIZATION_H, OBJECT} from '../utils/serviceConstants';
import {AUDIO, FILES, SRC, TEXT, TYPE} from '../../utils/consts/messageConstants';
import {BigModelTextToSpeechRequestBody} from '../../types/bigModelInternal';
import {DirectConnection} from '../../types/directConnection';
import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {Response as ResponseI} from '../../types/response';
import {BigModelTextToSpeech} from '../../types/bigModel';
import {DirectServiceIO} from '../utils/directServiceIO';
import {APIKey} from '../../types/APIKey';
import {DeepChat} from '../../deepChat';

// https://docs.bigmodel.cn/api-reference/%E6%A8%A1%E5%9E%8B-api/%E6%96%87%E6%9C%AC%E8%BD%AC%E8%AF%AD%E9%9F%B3
export class BigModelTextToSpeechIO extends DirectServiceIO {
  override insertKeyPlaceholderText = this.genereteAPIKeyName('BigModel');
  override keyHelpUrl = 'https://open.bigmodel.cn/usercenter/apikeys';
  url = 'https://open.bigmodel.cn/api/paas/v4/audio/speech';
  permittedErrorPrefixes = [AUTHORIZATION_H, AUTHENTICATION_ERROR_PREFIX];

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = JSON.parse(JSON.stringify(deepChat.directConnection)) as DirectConnection;
    const apiKey = directConnectionCopy.bigModel;
    super(deepChat, BIG_MODEL_BUILD_KEY_VERIFICATION_DETAILS(), BIG_MODEL_BUILD_HEADERS, apiKey);
    const config = directConnectionCopy.bigModel?.textToSpeech as BigModelTextToSpeech;
    if (typeof config === OBJECT) {
      this.cleanConfig(config);
      Object.assign(this.rawBody, config);
    }
    this.rawBody.model ??= 'cogtts';
    this.rawBody.voice ??= 'tongtong';
  }

  private cleanConfig(config: BigModelTextToSpeech & APIKey) {
    delete config.key;
  }

  private preprocessBody(body: BigModelTextToSpeechRequestBody, pMessages: MessageContentI[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body)) as BigModelTextToSpeechRequestBody;
    const lastMessage = pMessages[pMessages.length - 1];
    bodyCopy.input = lastMessage?.[TEXT] || '';
    return bodyCopy;
  }

  override async callServiceAPI(messages: Messages, pMessages: MessageContentI[]) {
    return this.callDirectServiceServiceAPI(messages, pMessages, this.preprocessBody.bind(this));
  }

  override async extractResultData(result: ArrayBuffer): Promise<ResponseI> {
    const blob = new Blob([result], {[TYPE]: 'audio/mpeg'});
    const audioUrl = URL.createObjectURL(blob);
    return {[FILES]: [{[SRC]: audioUrl, [TYPE]: AUDIO}]};
  }
}
