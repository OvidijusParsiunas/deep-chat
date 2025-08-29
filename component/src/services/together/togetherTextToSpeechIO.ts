import {TogetherTextToSpeechRequestBody} from '../../types/togetherInternal';
import {DirectConnection} from '../../types/directConnection';
import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {Response as ResponseI} from '../../types/response';
import {TogetherTextToSpeech} from '../../types/together';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {DirectServiceIO} from '../utils/directServiceIO';
import {TogetherUtils} from './utils/togetherUtils';
import {APIKey} from '../../types/APIKey';
import {DeepChat} from '../../deepChat';

// https://docs.together.ai/reference/audio-speech
export class TogetherTextToSpeechIO extends DirectServiceIO {
  override insertKeyPlaceholderText = 'Together AI API Key';
  override keyHelpUrl = 'https://api.together.xyz/settings/api-keys';
  url = 'https://api.together.xyz/v1/audio/speech';
  permittedErrorPrefixes = ['invalid_request_error', 'authentication_error'];

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = JSON.parse(JSON.stringify(deepChat.directConnection)) as DirectConnection;
    const apiKey = directConnectionCopy.together;
    super(deepChat, TogetherUtils.buildKeyVerificationDetails(), TogetherUtils.buildHeaders, apiKey);
    const config = directConnectionCopy.together?.textToSpeech;
    if (typeof config === 'object') {
      this.cleanConfig(config);
      Object.assign(this.rawBody, config);
    }
    this.rawBody.model ??= 'cartesia/sonic';
    this.rawBody.voice ??= 'laidback woman';
  }

  private cleanConfig(config: TogetherTextToSpeech & APIKey) {
    delete config.key;
  }

  private preprocessBody(body: TogetherTextToSpeechRequestBody, pMessages: MessageContentI[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body)) as TogetherTextToSpeechRequestBody;
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
