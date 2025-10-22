import {AUTHENTICATION_ERROR_PREFIX, INVALID_REQUEST_ERROR_PREFIX, OBJECT} from '../utils/serviceConstants';
import {X_BUILD_KEY_VERIFICATION_DETAILS, X_BUILD_HEADERS} from './utils/xUtils';
import {ERROR, TEXT} from '../../utils/consts/messageConstants';
import {DirectConnection} from '../../types/directConnection';
import {XMessage, XRequestBody} from '../../types/xInternal';
import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {Response as ResponseI} from '../../types/response';
import {DirectServiceIO} from '../utils/directServiceIO';
import {XResult} from '../../types/xResult';
import {APIKey} from '../../types/APIKey';
import {DeepChat} from '../../deepChat';
import {XChat} from '../../types/x';

export class XChatIO extends DirectServiceIO {
  override insertKeyPlaceholderText = this.genereteAPIKeyName('X');
  override keyHelpUrl = 'https://console.x.ai/team/default/api-keys';
  url = 'https://api.x.ai/v1/chat/completions';
  permittedErrorPrefixes = [INVALID_REQUEST_ERROR_PREFIX, AUTHENTICATION_ERROR_PREFIX];

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = JSON.parse(JSON.stringify(deepChat.directConnection)) as DirectConnection;
    const apiKey = directConnectionCopy.x;
    super(deepChat, X_BUILD_KEY_VERIFICATION_DETAILS(), X_BUILD_HEADERS, apiKey);
    const config = directConnectionCopy.x?.chat as XChat & APIKey;
    if (typeof config === OBJECT) this.completeConfig(config);
    this.maxMessages ??= -1;
    this.rawBody.model ??= 'grok-3-latest';
  }

  private preprocessBody(body: XRequestBody, pMessages: MessageContentI[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body)) as XRequestBody;
    const processedMessages = this.processMessages(pMessages).map((message) => {
      return {
        content: message[TEXT] || '',
        role: DirectServiceIO.getRoleViaUser(message.role),
      } as XMessage;
    });
    this.addSystemMessage(processedMessages);
    bodyCopy.messages = processedMessages;
    return bodyCopy;
  }

  override async callServiceAPI(messages: Messages, pMessages: MessageContentI[]) {
    this.callDirectServiceServiceAPI(messages, pMessages, this.preprocessBody.bind(this), {});
  }

  override async extractResultData(result: XResult): Promise<ResponseI> {
    if (result[ERROR]) throw result[ERROR].message;

    // Handle streaming response
    if (result.object === 'chat.completion.chunk') {
      const choice = result.choices?.[0];
      if (choice?.delta?.content) {
        return {[TEXT]: choice.delta.content};
      }
      return {[TEXT]: ''};
    }

    // Handle non-streaming response
    if (result.object === 'chat.completion' && result.choices?.[0]?.message) {
      return {[TEXT]: result.choices[0].message.content || ''};
    }

    return {[TEXT]: ''};
  }
}
