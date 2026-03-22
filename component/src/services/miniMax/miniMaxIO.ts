import {AUTHENTICATION_ERROR_PREFIX, INVALID_REQUEST_ERROR_PREFIX, OBJECT} from '../utils/serviceConstants';
import {MINI_MAX_BUILD_KEY_VERIFICATION_DETAILS, MINI_MAX_BUILD_HEADERS} from './utils/miniMaxUtils';
import {DEEP_COPY, ERROR, ROLE, TEXT} from '../../utils/consts/messageConstants';
import {MiniMaxRequestBody, MiniMaxMessage} from '../../types/miniMaxInternal';
import {DirectConnection} from '../../types/directConnection';
import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {Response as ResponseI} from '../../types/response';
import {DirectServiceIO} from '../utils/directServiceIO';
import {MiniMaxResult} from '../../types/miniMaxResult';
import {MiniMax} from '../../types/miniMax';
import {APIKey} from '../../types/APIKey';
import {DeepChat} from '../../deepChat';

// https://platform.minimaxi.com/document/chat-completion-v2
export class MiniMaxIO extends DirectServiceIO {
  override insertKeyPlaceholderText = this.genereteAPIKeyName('MiniMax');
  override keyHelpUrl = 'https://platform.minimaxi.com';
  url = 'https://api.minimax.io/v1/chat/completions';
  permittedErrorPrefixes = [INVALID_REQUEST_ERROR_PREFIX, AUTHENTICATION_ERROR_PREFIX, 'insufficient balance'];

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = DEEP_COPY(deepChat.directConnection) as DirectConnection;
    const config = directConnectionCopy.miniMax as MiniMax & APIKey;
    super(deepChat, MINI_MAX_BUILD_KEY_VERIFICATION_DETAILS(), MINI_MAX_BUILD_HEADERS, config);
    if (typeof config === OBJECT) this.completeConfig(config);
    this.maxMessages ??= -1;
    this.rawBody.model ??= 'MiniMax-M2.7';
  }

  private preprocessBody(body: MiniMaxRequestBody, pMessages: MessageContentI[]) {
    const bodyCopy = DEEP_COPY(body) as MiniMaxRequestBody;
    const processedMessages = this.processMessages(pMessages).map((message) => {
      return {
        content: message[TEXT] || '',
        [ROLE]: DirectServiceIO.getRoleViaUser(message[ROLE]),
      } as MiniMaxMessage;
    });
    this.addSystemMessage(processedMessages);
    bodyCopy.messages = processedMessages;
    return bodyCopy;
  }

  override async callServiceAPI(messages: Messages, pMessages: MessageContentI[]) {
    this.callDirectServiceServiceAPI(messages, pMessages, this.preprocessBody.bind(this), {});
  }

  override async extractResultData(result: MiniMaxResult): Promise<ResponseI> {
    if (result[ERROR]) throw result[ERROR].message;

    if (result.choices && result.choices.length > 0) {
      const choice = result.choices[0];

      // Handle streaming response
      if (choice.delta && choice.delta.content) {
        return {[TEXT]: choice.delta.content};
      }

      // Handle non-streaming response
      if (choice.message && choice.message.content) {
        return {[TEXT]: choice.message.content};
      }
    }

    return {[TEXT]: ''};
  }
}
