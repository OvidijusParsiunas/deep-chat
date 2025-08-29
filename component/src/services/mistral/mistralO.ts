import {DirectConnection} from '../../types/directConnection';
import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {DirectServiceIO} from '../utils/directServiceIO';
import {MistralResult} from '../../types/mistralRsult';
import {MistralUtils} from './utils/mistralUtils';
import {Stream} from '../../utils/HTTP/stream';
import {Response} from '../../types/response';
import {Mistral} from '../../types/mistral';
import {APIKey} from '../../types/APIKey';
import {DeepChat} from '../../deepChat';

// https://docs.mistral.ai/api/
export class MistralIO extends DirectServiceIO {
  override insertKeyPlaceholderText = 'Mistral API Key';
  override keyHelpUrl = 'https://console.mistral.ai/api-keys/';
  url = 'https://api.mistral.ai/v1/chat/completions';
  permittedErrorPrefixes = ['Invalid'];

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = JSON.parse(JSON.stringify(deepChat.directConnection)) as DirectConnection;
    const configAndAPIKey = directConnectionCopy.mistral;
    super(deepChat, MistralUtils.buildKeyVerificationDetails(), MistralUtils.buildHeaders, configAndAPIKey);
    if (configAndAPIKey) {
      this.cleanConfig(configAndAPIKey);
      Object.assign(this.rawBody, configAndAPIKey);
    }
    this.maxMessages ??= -1;
    this.rawBody.model ??= 'mistral-small-latest';
  }

  private cleanConfig(config: Mistral & APIKey) {
    delete config.key;
  }

  private preprocessBody(body: Mistral, pMessages: MessageContentI[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body));
    bodyCopy.messages = pMessages.map((message) => ({
      role: message.role === 'ai' ? 'assistant' : 'user',
      content: message.text || '',
    }));
    return bodyCopy;
  }

  override async callServiceAPI(messages: Messages, pMessages: MessageContentI[]) {
    if (!this.connectSettings) throw new Error('Request settings have not been set up');
    const body = this.preprocessBody(this.rawBody, pMessages);
    const stream = this.stream;
    if ((stream && (typeof stream !== 'object' || !stream.simulation)) || body.stream) {
      body.stream = true;
      Stream.request(this, body, messages);
    } else {
      HTTPRequest.request(this, body, messages);
    }
  }

  override async extractResultData(result: MistralResult): Promise<Response> {
    if (result.message) throw result.message;

    if (result.choices && result.choices.length > 0) {
      const choice = result.choices[0];

      // Handle streaming response
      if (choice.delta && choice.delta.content) {
        return {text: choice.delta.content};
      }

      // Handle non-streaming response
      if (choice.message && choice.message.content) {
        return {text: choice.message.content};
      }
    }

    return {text: ''};
  }
}
