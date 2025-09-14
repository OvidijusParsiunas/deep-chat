import {PerplexityRequestBody, PerplexityMessage} from '../../types/perplexityInternal';
import {MessageUtils} from '../../views/chat/messages/utils/messageUtils';
import {DirectConnection} from '../../types/directConnection';
import {PerplexityResult} from '../../types/perplexityResult';
import {MessageLimitUtils} from '../utils/messageLimitUtils';
import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {Response as ResponseI} from '../../types/response';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {DirectServiceIO} from '../utils/directServiceIO';
import {PerplexityUtils} from './utils/perplexityUtils';
import {Perplexity} from '../../types/perplexity';
import {Stream} from '../../utils/HTTP/stream';
import {APIKey} from '../../types/APIKey';
import {DeepChat} from '../../deepChat';

// https://docs.perplexity.ai/api-reference/chat-completions-post
export class PerplexityIO extends DirectServiceIO {
  override insertKeyPlaceholderText = 'Perplexity API Key';
  override keyHelpUrl = 'https://www.perplexity.ai/settings/api';
  url = 'https://api.perplexity.ai/chat/completions';
  permittedErrorPrefixes = ['Invalid', 'Authentication', 'Permission denied'];
  private readonly _systemMessage: string = 'You are a helpful assistant.';

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = JSON.parse(JSON.stringify(deepChat.directConnection)) as DirectConnection;
    const config = directConnectionCopy.perplexity;
    super(deepChat, PerplexityUtils.buildKeyVerificationDetails(), PerplexityUtils.buildHeaders, config);
    if (typeof config === 'object') {
      if (config.system_prompt) this._systemMessage = config.system_prompt;
      this.cleanConfig(config);
      Object.assign(this.rawBody, config);
    }
    this.maxMessages ??= -1;
    this.rawBody.model ??= 'sonar';
  }

  private cleanConfig(config: Perplexity & APIKey) {
    delete config.system_prompt;
    delete config.key;
  }

  private preprocessBody(body: PerplexityRequestBody, pMessages: MessageContentI[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body)) as PerplexityRequestBody;
    const processedMessages = MessageLimitUtils.getCharacterLimitMessages(
      pMessages,
      this.totalMessagesMaxCharLength ? this.totalMessagesMaxCharLength - this._systemMessage.length : -1
    ).map((message) => {
      return {
        content: message.text || '',
        role: message.role === MessageUtils.USER_ROLE ? 'user' : 'assistant',
      } as PerplexityMessage;
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

  override async extractResultData(result: PerplexityResult): Promise<ResponseI> {
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
