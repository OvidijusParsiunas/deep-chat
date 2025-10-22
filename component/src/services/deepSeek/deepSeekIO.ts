import {AUTHENTICATION_ERROR_PREFIX, INVALID_REQUEST_ERROR_PREFIX, OBJECT} from '../utils/serviceConstants';
import {DEEPSEEK_BUILD_HEADERS, DEEPSEEK_BUILD_KEY_VERIFICATION_DETAILS} from './utils/deepSeekUtils';
import {DeepSeekRequestBody, DeepSeekMessage} from '../../types/deepSeekInternal';
import {ERROR, TEXT} from '../../utils/consts/messageConstants';
import {DirectConnection} from '../../types/directConnection';
import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {Response as ResponseI} from '../../types/response';
import {DeepSeekResult} from '../../types/deepSeekResult';
import {DirectServiceIO} from '../utils/directServiceIO';
import {DeepSeek} from '../../types/deepSeek';
import {APIKey} from '../../types/APIKey';
import {DeepChat} from '../../deepChat';

// https://platform.deepseek.com/api-docs/
export class DeepSeekIO extends DirectServiceIO {
  override insertKeyPlaceholderText = this.genereteAPIKeyName('DeepSeek');
  override keyHelpUrl = 'https://platform.deepseek.com/api_keys';
  url = 'https://api.deepseek.com/v1/chat/completions';
  permittedErrorPrefixes = [INVALID_REQUEST_ERROR_PREFIX, AUTHENTICATION_ERROR_PREFIX];

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = JSON.parse(JSON.stringify(deepChat.directConnection)) as DirectConnection;
    const config = directConnectionCopy.deepSeek as DeepSeek & APIKey;
    super(deepChat, DEEPSEEK_BUILD_KEY_VERIFICATION_DETAILS(), DEEPSEEK_BUILD_HEADERS, config);
    if (typeof config === OBJECT) this.completeConfig(config);
    this.maxMessages ??= -1;
    this.rawBody.model ??= 'deepseek-chat';
    this.rawBody.temperature ??= 1;
    this.rawBody.max_tokens ??= 4096;
  }

  private preprocessBody(body: DeepSeekRequestBody, pMessages: MessageContentI[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body)) as DeepSeekRequestBody;
    const processedMessages = this.processMessages(pMessages).map((message) => {
      return {
        content: message[TEXT] || '',
        role: DirectServiceIO.getRoleViaUser(message.role),
      } as DeepSeekMessage;
    });
    this.addSystemMessage(processedMessages);
    bodyCopy.messages = processedMessages;
    return bodyCopy;
  }

  override async callServiceAPI(messages: Messages, pMessages: MessageContentI[]) {
    this.callDirectServiceServiceAPI(messages, pMessages, this.preprocessBody.bind(this), {});
  }

  override async extractResultData(result: DeepSeekResult): Promise<ResponseI> {
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
