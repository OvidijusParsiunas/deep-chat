import {AUTHENTICATION_ERROR_PREFIX, INVALID_REQUEST_ERROR_PREFIX, OBJECT} from '../utils/serviceConstants';
import {XNormalResult, XOutputMessage, XResult, XStreamEvent} from '../../types/xResult';
import {X_BUILD_KEY_VERIFICATION_DETAILS, X_BUILD_HEADERS} from './utils/xUtils';
import {DEEP_COPY, ERROR, ROLE, TEXT} from '../../utils/consts/messageConstants';
import {DirectConnection} from '../../types/directConnection';
import {XMessage, XRequestBody} from '../../types/xInternal';
import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {Response as ResponseI} from '../../types/response';
import {DirectServiceIO} from '../utils/directServiceIO';
import {APIKey} from '../../types/APIKey';
import {DeepChat} from '../../deepChat';
import {XChat} from '../../types/x';

export class XChatIO extends DirectServiceIO {
  override insertKeyPlaceholderText = this.genereteAPIKeyName('X');
  override keyHelpUrl = 'https://console.x.ai/team/default/api-keys';
  url = 'https://api.x.ai/v1/responses';
  permittedErrorPrefixes = [INVALID_REQUEST_ERROR_PREFIX, AUTHENTICATION_ERROR_PREFIX];

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = DEEP_COPY(deepChat.directConnection) as DirectConnection;
    const apiKey = directConnectionCopy.x;
    super(deepChat, X_BUILD_KEY_VERIFICATION_DETAILS(), X_BUILD_HEADERS, apiKey);
    const config = directConnectionCopy.x?.chat as XChat & APIKey;
    if (typeof config === OBJECT) this.completeConfig(config);
    this.maxMessages ??= -1;
    this.rawBody.model ??= 'grok-4.3';
  }

  private preprocessBody(body: XRequestBody, pMessages: MessageContentI[]) {
    const bodyCopy = DEEP_COPY(body) as XRequestBody;
    const processedMessages = this.processMessages(pMessages).map((message) => {
      return {
        content: message[TEXT] || '',
        [ROLE]: DirectServiceIO.getRoleViaUser(message[ROLE]),
      } as XMessage;
    });
    bodyCopy.input = processedMessages;
    if (this.systemMessage) bodyCopy.instructions = this.systemMessage;
    return bodyCopy;
  }

  override async callServiceAPI(messages: Messages, pMessages: MessageContentI[]) {
    this.callDirectServiceServiceAPI(messages, pMessages, this.preprocessBody.bind(this), {});
  }

  override async extractResultData(result: XResult): Promise<ResponseI> {
    if (result[ERROR]) throw result[ERROR].message;

    const streamEvent = result as XStreamEvent;
    if (typeof streamEvent.type === 'string' && streamEvent.type.startsWith('response.')) {
      if (streamEvent.type === 'response.output_text.delta') {
        return {[TEXT]: streamEvent.delta || ''};
      }
      return {[TEXT]: ''};
    }

    const normalResult = result as XNormalResult;
    if (normalResult.object === 'response' && Array.isArray(normalResult.output)) {
      const text = normalResult.output
        .filter((item): item is XOutputMessage => item.type === 'message')
        .flatMap((item) => item.content || [])
        .filter((content) => content.type === 'output_text')
        .map((content) => content.text || '')
        .join('');
      return {[TEXT]: text};
    }

    return {[TEXT]: ''};
  }
}
