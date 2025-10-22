import {AUTHENTICATION_ERROR_PREFIX, INVALID_REQUEST_ERROR_PREFIX, OBJECT} from '../utils/serviceConstants';
import {TOGETHER_BUILD_HEADERS, TOGETHER_BUILD_KEY_VERIFICATION_DETAILS} from './utils/togetherUtils';
import {TogetherResult, TogetherNormalResult, TogetherStreamEvent} from '../../types/togetherResult';
import {TogetherMessage, TogetherRequestBody} from '../../types/togetherInternal';
import {AI, ASSISTANT, ERROR, TEXT} from '../../utils/consts/messageConstants';
import {DirectConnection} from '../../types/directConnection';
import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {Response as ResponseI} from '../../types/response';
import {DirectServiceIO} from '../utils/directServiceIO';
import {TogetherChat} from '../../types/together';
import {APIKey} from '../../types/APIKey';
import {DeepChat} from '../../deepChat';

// https://docs.together.ai/reference/chat-completions-1
export class TogetherChatIO extends DirectServiceIO {
  override insertKeyPlaceholderText = this.genereteAPIKeyName('Together AI');
  override keyHelpUrl = 'https://api.together.xyz/settings/api-keys';
  url = 'https://api.together.xyz/v1/chat/completions';
  permittedErrorPrefixes = [INVALID_REQUEST_ERROR_PREFIX, AUTHENTICATION_ERROR_PREFIX];

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = JSON.parse(JSON.stringify(deepChat.directConnection)) as DirectConnection;
    const apiKey = directConnectionCopy.together;
    super(deepChat, TOGETHER_BUILD_KEY_VERIFICATION_DETAILS(), TOGETHER_BUILD_HEADERS, apiKey);
    const config = directConnectionCopy.together?.chat as TogetherChat & APIKey;
    if (typeof config === OBJECT) this.completeConfig(config);
    this.maxMessages ??= -1;
    this.rawBody.model ??= 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo';
  }

  private preprocessBody(body: TogetherRequestBody, pMessages: MessageContentI[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body)) as TogetherRequestBody;
    const processedMessages: TogetherMessage[] = this.processMessages(pMessages).map((message) => {
      return {
        content: message[TEXT] || '',
        role: message.role === AI ? ASSISTANT : (message.role as 'user'),
      };
    });
    this.addSystemMessage(processedMessages);
    bodyCopy.messages = processedMessages;
    return bodyCopy;
  }

  override async callServiceAPI(messages: Messages, pMessages: MessageContentI[]) {
    this.callDirectServiceServiceAPI(messages, pMessages, this.preprocessBody.bind(this), {});
  }

  override async extractResultData(result: TogetherResult): Promise<ResponseI> {
    if (result[ERROR]) throw result[ERROR].message;
    if (result.choices.length > 0) {
      if ((result.choices[0] as TogetherNormalResult).message !== undefined) {
        return {[TEXT]: (result.choices[0] as TogetherNormalResult).message.content};
      }
      if ((result.choices[0] as TogetherStreamEvent).delta !== undefined) {
        return {[TEXT]: (result.choices[0] as TogetherStreamEvent).delta.content};
      }
    }
    return {[TEXT]: ''};
  }
}
