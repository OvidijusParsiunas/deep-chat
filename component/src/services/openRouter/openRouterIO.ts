import {INVALID_REQUEST_ERROR_PREFIX, AUTHENTICATION_ERROR_PREFIX} from '../utils/serviceConstants';
import {DirectConnection} from '../../types/directConnection';
import {DEEP_COPY} from '../../utils/consts/messageConstants';
import {ChatCompletionsIO} from '../utils/chatCompletionsIO';
import {OpenRouterChat} from '../../types/openRouter';
import {APIKey} from '../../types/APIKey';
import {DeepChat} from '../../deepChat';
import {
  CHAT_COMPLETIONS_BUILD_HEADERS,
  CHAT_COMPLETIONS_BUILD_KEY_VERIFICATION_DETAILS,
} from '../utils/chatCompletionsUtils';

// https://openrouter.ai/docs/api/api-reference
export class OpenRouterIO extends ChatCompletionsIO {
  override insertKeyPlaceholderText = this.genereteAPIKeyName('OpenRouter');
  override keyHelpUrl = 'https://openrouter.ai/keys';
  url = 'https://openrouter.ai/api/v1/chat/completions';
  permittedErrorPrefixes = [INVALID_REQUEST_ERROR_PREFIX, AUTHENTICATION_ERROR_PREFIX];

  constructor(deepChat: DeepChat) {
    const config = (DEEP_COPY(deepChat.directConnection) as DirectConnection).openRouter;
    const keyVerificationDetails = CHAT_COMPLETIONS_BUILD_KEY_VERIFICATION_DETAILS('https://openrouter.ai/api/v1/key');
    const functionHandler = (deepChat.directConnection?.openRouter as OpenRouterChat)?.function_handler;
    super(deepChat, keyVerificationDetails, CHAT_COMPLETIONS_BUILD_HEADERS, config as APIKey, config, functionHandler);
    this.rawBody.model ??= 'openai/gpt-4o';
    this.rawBody.max_tokens ??= 1000;
  }
}
