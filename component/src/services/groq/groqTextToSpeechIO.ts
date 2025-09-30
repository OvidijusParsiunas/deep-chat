import {INVALID_ERROR_PREFIX, OBJECT} from '../utils/serviceConstants';
import {GroqTextToSpeechRequestBody} from '../../types/groqInternal';
import {DirectConnection} from '../../types/directConnection';
import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {Response as ResponseI} from '../../types/response';
import {DirectServiceIO} from '../utils/directServiceIO';
import {GroqTextToSpeech} from '../../types/groq';
import {GroqUtils} from './utils/groqUtils';
import {APIKey} from '../../types/APIKey';
import {DeepChat} from '../../deepChat';

// https://console.groq.com/docs/api-reference#audio-speechCalled
export class GroqTextToSpeechIO extends DirectServiceIO {
  override insertKeyPlaceholderText = this.genereteAPIKeyName('Groq');
  override keyHelpUrl = 'https://console.groq.com/keys';
  url = 'https://api.groq.com/openai/v1/audio/speech';
  permittedErrorPrefixes = [INVALID_ERROR_PREFIX, 'property'];

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = JSON.parse(JSON.stringify(deepChat.directConnection)) as DirectConnection;
    const apiKey = directConnectionCopy.groq;
    super(deepChat, GroqUtils.buildKeyVerificationDetails(), GroqUtils.buildHeaders, apiKey);
    const config = directConnectionCopy.groq?.textToSpeech as GroqTextToSpeech & APIKey;
    if (typeof config === OBJECT) {
      this.cleanConfig(config);
      Object.assign(this.rawBody, config);
    }
    this.rawBody.model ??= 'playai-tts';
    this.rawBody.voice ??= 'Fritz-PlayAI';
    this.rawBody.response_format ??= 'mp3';
  }

  private cleanConfig(config: GroqTextToSpeech & APIKey) {
    delete config.key;
  }

  private preprocessBody(body: GroqTextToSpeechRequestBody, pMessages: MessageContentI[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body)) as GroqTextToSpeechRequestBody;
    const lastMessage = pMessages[pMessages.length - 1];
    bodyCopy.input = lastMessage?.text || '';
    return bodyCopy;
  }

  override async callServiceAPI(messages: Messages, pMessages: MessageContentI[]) {
    return this.callDirectServiceServiceAPI(messages, pMessages, this.preprocessBody.bind(this));
  }

  override async extractResultData(result: ArrayBuffer): Promise<ResponseI> {
    const format = this.rawBody.response_format || 'mp3';
    const blob = new Blob([result], {type: `audio/${format}`});
    const audioUrl = URL.createObjectURL(blob);
    return {files: [{src: audioUrl, type: 'audio'}]};
  }
}
