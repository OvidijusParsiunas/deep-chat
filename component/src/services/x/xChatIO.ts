import {AUTHENTICATION_ERROR_PREFIX, INVALID_REQUEST_ERROR_PREFIX, OBJECT} from '../utils/serviceConstants';
import {MessageUtils} from '../../views/chat/messages/utils/messageUtils';
import {DirectConnection} from '../../types/directConnection';
import {XMessage, XRequestBody} from '../../types/xInternal';
import {MessageLimitUtils} from '../utils/messageLimitUtils';
import {MessageContentI} from '../../types/messagesInternal';
import {TEXT_KEY} from '../../utils/consts/messageConstants';
import {Messages} from '../../views/chat/messages/messages';
import {Response as ResponseI} from '../../types/response';
import {DirectServiceIO} from '../utils/directServiceIO';
import {XResult} from '../../types/xResult';
import {APIKey} from '../../types/APIKey';
import {DeepChat} from '../../deepChat';
import {XUtils} from './utils/xUtils';
import {XChat} from '../../types/x';

export class XChatIO extends DirectServiceIO {
  override insertKeyPlaceholderText = this.genereteAPIKeyName('X');
  override keyHelpUrl = 'https://console.x.ai/team/default/api-keys';
  url = 'https://api.x.ai/v1/chat/completions';
  permittedErrorPrefixes = [INVALID_REQUEST_ERROR_PREFIX, AUTHENTICATION_ERROR_PREFIX];
  private readonly _systemMessage: string = '';

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = JSON.parse(JSON.stringify(deepChat.directConnection)) as DirectConnection;
    const apiKey = directConnectionCopy.x;
    super(deepChat, XUtils.buildKeyVerificationDetails(), XUtils.buildHeaders, apiKey);
    const config = directConnectionCopy.x?.chat as XChat & APIKey;
    if (typeof config === OBJECT) {
      if (config.system_prompt) this._systemMessage = config.system_prompt;
      this.cleanConfig(config);
      Object.assign(this.rawBody, config);
    }
    this.maxMessages ??= -1;
    this.rawBody.model ??= 'grok-3-latest';
  }

  private cleanConfig(config: XChat & APIKey) {
    delete config.system_prompt;
    delete config.key;
  }

  private preprocessBody(body: XRequestBody, pMessages: MessageContentI[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body)) as XRequestBody;
    const processedMessages = MessageLimitUtils.getCharacterLimitMessages(
      pMessages,
      this.totalMessagesMaxCharLength ? this.totalMessagesMaxCharLength - this._systemMessage.length : -1
    ).map((message) => {
      return {
        content: message.text || '',
        role: message.role === MessageUtils.USER_ROLE ? 'user' : 'assistant',
      } as XMessage;
    });

    const systemMessage: XMessage = {
      role: 'system',
      content: this._systemMessage,
    };

    bodyCopy.messages = [systemMessage, ...processedMessages];
    return bodyCopy;
  }

  override async callServiceAPI(messages: Messages, pMessages: MessageContentI[]) {
    this.callDirectServiceServiceAPI(messages, pMessages, this.preprocessBody, {});
  }

  override async extractResultData(result: XResult): Promise<ResponseI> {
    if (result.error) throw result.error.message;

    // Handle streaming response
    if (result.object === 'chat.completion.chunk') {
      const choice = result.choices?.[0];
      if (choice?.delta?.content) {
        return {[TEXT_KEY]: choice.delta.content};
      }
      return {[TEXT_KEY]: ''};
    }

    // Handle non-streaming response
    if (result.object === 'chat.completion' && result.choices?.[0]?.message) {
      return {[TEXT_KEY]: result.choices[0].message.content || ''};
    }

    return {[TEXT_KEY]: ''};
  }
}
