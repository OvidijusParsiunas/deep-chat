import {DeepSeekRequestBody, DeepSeekMessage} from '../../types/deepSeekInternal';
import {MessageUtils} from '../../views/chat/messages/utils/messageUtils';
import {DirectConnection} from '../../types/directConnection';
import {MessageLimitUtils} from '../utils/messageLimitUtils';
import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {Response as ResponseI} from '../../types/response';
import {DeepSeekResult} from '../../types/deepSeekResult';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {DirectServiceIO} from '../utils/directServiceIO';
import {DeepSeekUtils} from './utils/deepSeekUtils';
import {Stream} from '../../utils/HTTP/stream';
import {DeepSeek} from '../../types/deepSeek';
import {APIKey} from '../../types/APIKey';
import {DeepChat} from '../../deepChat';

// https://platform.deepseek.com/api-docs/
export class DeepSeekIO extends DirectServiceIO {
  override insertKeyPlaceholderText = 'DeepSeek API Key';
  override keyHelpUrl = 'https://platform.deepseek.com/api_keys';
  url = 'https://api.deepseek.com/v1/chat/completions';
  permittedErrorPrefixes = ['invalid_request_error', 'authentication_error'];
  private readonly _systemMessage: string = 'You are a helpful assistant.';

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = JSON.parse(JSON.stringify(deepChat.directConnection)) as DirectConnection;
    const config = directConnectionCopy.deepSeek;
    super(deepChat, DeepSeekUtils.buildKeyVerificationDetails(), DeepSeekUtils.buildHeaders, config);
    if (typeof config === 'object') {
      if (config.system_prompt) this._systemMessage = config.system_prompt;
      this.cleanConfig(config);
      Object.assign(this.rawBody, config);
    }
    this.maxMessages ??= -1;
    this.rawBody.model ??= 'deepseek-chat';
    this.rawBody.temperature ??= 1;
    this.rawBody.max_tokens ??= 4096;
  }

  private cleanConfig(config: DeepSeek & APIKey) {
    delete config.system_prompt;
    delete config.key;
  }

  private preprocessBody(body: DeepSeekRequestBody, pMessages: MessageContentI[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body)) as DeepSeekRequestBody;
    const processedMessages = MessageLimitUtils.getCharacterLimitMessages(
      pMessages,
      this.totalMessagesMaxCharLength ? this.totalMessagesMaxCharLength - this._systemMessage.length : -1
    ).map((message) => {
      return {
        content: message.text || '',
        role: message.role === MessageUtils.USER_ROLE ? 'user' : 'assistant',
      } as DeepSeekMessage;
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

  override async extractResultData(result: DeepSeekResult): Promise<ResponseI> {
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

    return {text: ''};
  }
}
