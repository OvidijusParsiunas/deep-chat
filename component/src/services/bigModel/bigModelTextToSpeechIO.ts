import {BigModelTextToSpeechRequestBody} from '../../types/bigModelInternal';
import {DirectConnection} from '../../types/directConnection';
import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {Response as ResponseI} from '../../types/response';
import {BigModelTextToSpeech} from '../../types/bigModel';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {DirectServiceIO} from '../utils/directServiceIO';
import {BigModelUtils} from './utils/bigModelUtils';
import {APIKey} from '../../types/APIKey';
import {DeepChat} from '../../deepChat';

// https://docs.bigmodel.cn/api-reference/%E6%A8%A1%E5%9E%8B-api/%E6%96%87%E6%9C%AC%E8%BD%AC%E8%AF%AD%E9%9F%B3
export class BigModelTextToSpeechIO extends DirectServiceIO {
  override insertKeyPlaceholderText = 'BigModel API Key';
  override keyHelpUrl = 'https://open.bigmodel.cn/usercenter/apikeys';
  url = 'https://open.bigmodel.cn/api/paas/v4/audio/speech';
  permittedErrorPrefixes = ['Authorization', 'authentication_error'];

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = JSON.parse(JSON.stringify(deepChat.directConnection)) as DirectConnection;
    const apiKey = directConnectionCopy.bigModel;
    super(deepChat, BigModelUtils.buildKeyVerificationDetails(), BigModelUtils.buildHeaders, apiKey);
    const config = directConnectionCopy.bigModel?.textToSpeech;
    if (typeof config === 'object') {
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
    bodyCopy.input = lastMessage?.text || '';
    return bodyCopy;
  }

  override async callServiceAPI(messages: Messages, pMessages: MessageContentI[]) {
    if (!this.connectSettings) throw new Error('Request settings have not been set up');
    const body = this.preprocessBody(this.rawBody, pMessages);
    return await HTTPRequest.request(this, body, messages);
  }

  override async extractResultData(result: ArrayBuffer): Promise<ResponseI> {
    const blob = new Blob([result], {type: 'audio/mpeg'});
    const audioUrl = URL.createObjectURL(blob);
    return {files: [{src: audioUrl, type: 'audio'}]};
  }
}
