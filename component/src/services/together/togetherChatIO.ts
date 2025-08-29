import {TogetherResult, TogetherNormalResult, TogetherStreamEvent} from '../../types/togetherResult';
import {TogetherMessage, TogetherRequestBody} from '../../types/togetherInternal';
import {DirectConnection} from '../../types/directConnection';
import {MessageLimitUtils} from '../utils/messageLimitUtils';
import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {Response as ResponseI} from '../../types/response';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {DirectServiceIO} from '../utils/directServiceIO';
import {TogetherUtils} from './utils/togetherUtils';
import {TogetherChat} from '../../types/together';
import {Stream} from '../../utils/HTTP/stream';
import {APIKey} from '../../types/APIKey';
import {DeepChat} from '../../deepChat';

// https://docs.together.ai/reference/chat-completions-1
export class TogetherChatIO extends DirectServiceIO {
  override insertKeyPlaceholderText = 'Together AI API Key';
  override keyHelpUrl = 'https://api.together.xyz/settings/api-keys';
  url = 'https://api.together.xyz/v1/chat/completions';
  permittedErrorPrefixes = ['invalid_request_error', 'authentication_error'];
  private readonly _systemMessage: string = 'You are a helpful assistant.';

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = JSON.parse(JSON.stringify(deepChat.directConnection)) as DirectConnection;
    const apiKey = directConnectionCopy.together;
    super(deepChat, TogetherUtils.buildKeyVerificationDetails(), TogetherUtils.buildHeaders, apiKey);
    const config = directConnectionCopy.together?.chat;
    if (typeof config === 'object') {
      if (config.system_prompt) this._systemMessage = config.system_prompt;
      this.cleanConfig(config);
      Object.assign(this.rawBody, config);
    }
    this.maxMessages ??= -1;
    this.rawBody.model ??= 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo';
  }

  private cleanConfig(config: TogetherChat & APIKey) {
    delete config.system_prompt;
    delete config.key;
  }

  private preprocessBody(body: TogetherRequestBody, pMessages: MessageContentI[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body)) as TogetherRequestBody;
    const processedMessages: TogetherMessage[] = MessageLimitUtils.getCharacterLimitMessages(
      pMessages,
      this.totalMessagesMaxCharLength ? this.totalMessagesMaxCharLength - this._systemMessage.length : -1
    ).map((message) => {
      return {
        content: message.text || '',
        role: message.role === 'ai' ? ('assistant' as const) : (message.role as 'user'),
      };
    });
    if (this._systemMessage) {
      processedMessages.unshift({role: 'system', content: this._systemMessage});
    }
    bodyCopy.messages = processedMessages;
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

  override async extractResultData(result: TogetherResult): Promise<ResponseI> {
    if (result.error) throw result.error.message;
    if (result.choices.length > 0) {
      if ((result.choices[0] as TogetherNormalResult).message !== undefined) {
        return {text: (result.choices[0] as TogetherNormalResult).message.content};
      }
      if ((result.choices[0] as TogetherStreamEvent).delta !== undefined) {
        return {text: (result.choices[0] as TogetherStreamEvent).delta.content};
      }
    }
    return {text: ''};
  }
}
