import {MiniMaxRequestBody, MiniMaxMessage} from '../../types/miniMaxInternal';
import {MessageUtils} from '../../views/chat/messages/utils/messageUtils';
import {DirectConnection} from '../../types/directConnection';
import {MessageLimitUtils} from '../utils/messageLimitUtils';
import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {Response as ResponseI} from '../../types/response';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {DirectServiceIO} from '../utils/directServiceIO';
import {MiniMaxResult} from '../../types/miniMaxResult';
import {MiniMaxUtils} from './utils/miniMaxUtils';
import {Stream} from '../../utils/HTTP/stream';
import {MiniMax} from '../../types/miniMax';
import {APIKey} from '../../types/APIKey';
import {DeepChat} from '../../deepChat';

// https://www.minimax.io/platform/document/ChatCompletion%20v2?key=66701d281d57f38758d581d0#QklxsNSbaf6kM4j6wjO5eEek
export class MiniMaxIO extends DirectServiceIO {
  override insertKeyPlaceholderText = 'MiniMax API Key';
  override keyHelpUrl = 'https://www.minimaxi.com';
  url = 'https://api.minimax.io/v1/text/chatcompletion_v2';
  permittedErrorPrefixes = ['invalid_request_error', 'authentication_error', 'insufficient balance'];
  private readonly _systemMessage: string = 'You are a helpful assistant.';

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = JSON.parse(JSON.stringify(deepChat.directConnection)) as DirectConnection;
    const config = directConnectionCopy.miniMax;
    super(deepChat, MiniMaxUtils.buildKeyVerificationDetails(), MiniMaxUtils.buildHeaders, config);
    if (typeof config === 'object') {
      if (config.system_prompt) this._systemMessage = config.system_prompt;
      this.cleanConfig(config);
      Object.assign(this.rawBody, config);
    }
    this.maxMessages ??= -1;
    this.rawBody.model ??= 'MiniMax-M1';
  }

  private cleanConfig(config: MiniMax & APIKey) {
    delete config.system_prompt;
    delete config.key;
  }

  private preprocessBody(body: MiniMaxRequestBody, pMessages: MessageContentI[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body)) as MiniMaxRequestBody;
    const processedMessages = MessageLimitUtils.getCharacterLimitMessages(
      pMessages,
      this.totalMessagesMaxCharLength ? this.totalMessagesMaxCharLength - this._systemMessage.length : -1
    ).map((message) => {
      return {
        content: message.text || '',
        role: message.role === MessageUtils.USER_ROLE ? 'user' : 'assistant',
      } as MiniMaxMessage;
    });

    bodyCopy.messages = [{role: 'system', content: this._systemMessage}, ...processedMessages];
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

  override async extractResultData(result: MiniMaxResult): Promise<ResponseI> {
    if (result.error) throw result.error.message;

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

    if (typeof result.base_resp?.status_code === 'number' && result.base_resp.status_code > 0) {
      throw result.base_resp.status_msg;
    }

    return {text: ''};
  }
}
