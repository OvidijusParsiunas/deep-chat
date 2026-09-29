import {PERPLEXITY_BUILD_HEADERS, PERPLEXITY_BUILD_KEY_VERIFICATION_DETAILS} from './utils/perplexityUtils';
import {AUTHENTICATION, INVALID_ERROR_PREFIX} from '../utils/serviceConstants';
import {DEEP_COPY, TEXT} from '../../utils/consts/messageConstants';
import {DirectConnection} from '../../types/directConnection';
import {MessageContentI} from '../../types/messagesInternal';
import {ChatCompletionsIO} from '../utils/chatCompletionsIO';
import {APIKey} from '../../types/APIKey';
import {DeepChat} from '../../deepChat';

// https://docs.perplexity.ai/api-reference/chat-completions-post
export class PerplexityIO extends ChatCompletionsIO {
  override insertKeyPlaceholderText = this.genereteAPIKeyName('Perplexity');
  override keyHelpUrl = 'https://www.perplexity.ai/settings/api';
  url = 'https://api.perplexity.ai/chat/completions';
  permittedErrorPrefixes = [INVALID_ERROR_PREFIX, AUTHENTICATION, 'Permission denied'];

  constructor(deepChat: DeepChat) {
    const config = (DEEP_COPY(deepChat.directConnection) as DirectConnection).perplexity;
    // prettier-ignore
    super(deepChat, PERPLEXITY_BUILD_KEY_VERIFICATION_DETAILS(), PERPLEXITY_BUILD_HEADERS, config as APIKey, config);
    this.rawBody.model ??= 'sonar';
  }

  protected override getContent(message: MessageContentI) {
    return message[TEXT] || '';
  }
}
