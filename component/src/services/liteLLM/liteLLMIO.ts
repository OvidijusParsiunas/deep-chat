import {INVALID_REQUEST_ERROR_PREFIX, AUTHENTICATION_ERROR_PREFIX, PLACEHOLDER_KEY} from '../utils/serviceConstants';
import {LITELLM_BUILD_HEADERS, LITELLM_BUILD_KEY_VERIFICATION_DETAILS} from './utils/liteLLMUtils';
import {DEEP_COPY, TEXT} from '../../utils/consts/messageConstants';
import {DirectConnection} from '../../types/directConnection';
import {MessageContentI} from '../../types/messagesInternal';
import {ChatCompletionsIO} from '../utils/chatCompletionsIO';
import {DeepChat} from '../../deepChat';

// https://docs.litellm.ai/docs/
export class LiteLLMIO extends ChatCompletionsIO {
  url = 'http://localhost:4000/v1/chat/completions';
  permittedErrorPrefixes = [INVALID_REQUEST_ERROR_PREFIX, AUTHENTICATION_ERROR_PREFIX];

  constructor(deepChat: DeepChat) {
    const config = (DEEP_COPY(deepChat.directConnection) as DirectConnection).liteLLM;
    const key = typeof config === 'object' ? (config.key ?? PLACEHOLDER_KEY) : PLACEHOLDER_KEY;
    super(deepChat, LITELLM_BUILD_KEY_VERIFICATION_DETAILS(), LITELLM_BUILD_HEADERS, {key}, config);
    this.rawBody.model ??= 'gpt-4o-mini';
    this.rawBody.temperature ??= 1;
    this.rawBody.max_tokens ??= 4096;
  }

  protected override getContent(message: MessageContentI) {
    return message[TEXT] || '';
  }
}
