import {PERPLEXITY_BUILD_HEADERS, PERPLEXITY_BUILD_KEY_VERIFICATION_DETAILS} from './utils/perplexityUtils';
import {PerplexityRequestBody, PerplexityMessage} from '../../types/perplexityInternal';
import {AUTHENTICATION, INVALID_ERROR_PREFIX, OBJECT} from '../utils/serviceConstants';
import {DEEP_COPY, ERROR, ROLE, TEXT} from '../../utils/consts/messageConstants';
import {DirectConnection} from '../../types/directConnection';
import {PerplexityResult} from '../../types/perplexityResult';
import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {Response as ResponseI} from '../../types/response';
import {DirectServiceIO} from '../utils/directServiceIO';
import {Perplexity} from '../../types/perplexity';
import {APIKey} from '../../types/APIKey';
import {DeepChat} from '../../deepChat';

// https://docs.perplexity.ai/api-reference/chat-completions-post
export class PerplexityIO extends DirectServiceIO {
  override insertKeyPlaceholderText = this.genereteAPIKeyName('Perplexity');
  override keyHelpUrl = 'https://www.perplexity.ai/settings/api';
  url = 'https://api.perplexity.ai/chat/completions';
  permittedErrorPrefixes = [INVALID_ERROR_PREFIX, AUTHENTICATION, 'Permission denied'];

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = DEEP_COPY(deepChat.directConnection) as DirectConnection;
    const config = directConnectionCopy.perplexity as Perplexity & APIKey;
    super(deepChat, PERPLEXITY_BUILD_KEY_VERIFICATION_DETAILS(), PERPLEXITY_BUILD_HEADERS, config);
    if (typeof config === OBJECT) this.completeConfig(config);
    this.maxMessages ??= -1;
    this.rawBody.model ??= 'sonar';
  }

  private preprocessBody(body: PerplexityRequestBody, pMessages: MessageContentI[]) {
    const bodyCopy = DEEP_COPY(body) as PerplexityRequestBody;
    const processedMessages = this.processMessages(pMessages).map((message) => {
      return {
        content: message[TEXT] || '',
        [ROLE]: DirectServiceIO.getRoleViaUser(message[ROLE]),
      } as PerplexityMessage;
    });
    this.addSystemMessage(processedMessages);
    bodyCopy.messages = processedMessages;
    return bodyCopy;
  }

  override async callServiceAPI(messages: Messages, pMessages: MessageContentI[]) {
    this.callDirectServiceServiceAPI(messages, pMessages, this.preprocessBody.bind(this), {});
  }

  override async extractResultData(result: PerplexityResult): Promise<ResponseI> {
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
