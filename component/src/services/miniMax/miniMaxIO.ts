import {AUTHENTICATION_ERROR_PREFIX, INVALID_REQUEST_ERROR_PREFIX, OBJECT} from '../utils/serviceConstants';
import {MiniMaxRequestBody, MiniMaxMessage} from '../../types/miniMaxInternal';
import {MessageUtils} from '../../views/chat/messages/utils/messageUtils';
import {DirectConnection} from '../../types/directConnection';
import {MessageLimitUtils} from '../utils/messageLimitUtils';
import {MessageContentI} from '../../types/messagesInternal';
import {TEXT_KEY} from '../../utils/consts/messageConstants';
import {Messages} from '../../views/chat/messages/messages';
import {Response as ResponseI} from '../../types/response';
import {DirectServiceIO} from '../utils/directServiceIO';
import {MiniMaxResult} from '../../types/miniMaxResult';
import {MiniMaxUtils} from './utils/miniMaxUtils';
import {MiniMax} from '../../types/miniMax';
import {APIKey} from '../../types/APIKey';
import {DeepChat} from '../../deepChat';

// https://www.minimax.io/platform/document/ChatCompletion%20v2?key=66701d281d57f38758d581d0#QklxsNSbaf6kM4j6wjO5eEek
export class MiniMaxIO extends DirectServiceIO {
  override insertKeyPlaceholderText = this.genereteAPIKeyName('MiniMax');
  override keyHelpUrl = 'https://www.minimaxi.com';
  url = 'https://api.minimax.io/v1/text/chatcompletion_v2';
  permittedErrorPrefixes = [INVALID_REQUEST_ERROR_PREFIX, AUTHENTICATION_ERROR_PREFIX, 'insufficient balance'];
  private readonly _systemMessage: string = '';

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = JSON.parse(JSON.stringify(deepChat.directConnection)) as DirectConnection;
    const config = directConnectionCopy.miniMax as MiniMax & APIKey;
    super(deepChat, MiniMaxUtils.buildKeyVerificationDetails(), MiniMaxUtils.buildHeaders, config);
    if (typeof config === OBJECT) {
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
    this.callDirectServiceServiceAPI(messages, pMessages, this.preprocessBody.bind(this), {});
  }

  override async extractResultData(result: MiniMaxResult): Promise<ResponseI> {
    if (result.error) throw result.error.message;

    if (result.choices && result.choices.length > 0) {
      const choice = result.choices[0];

      // Handle streaming response
      if (choice.delta && choice.delta.content) {
        return {[TEXT_KEY]: choice.delta.content};
      }

      // Handle non-streaming response
      if (choice.message && choice.message.content) {
        return {[TEXT_KEY]: choice.message.content};
      }
    }

    if (typeof result.base_resp?.status_code === 'number' && result.base_resp.status_code > 0) {
      throw result.base_resp.status_msg;
    }

    return {[TEXT_KEY]: ''};
  }
}
