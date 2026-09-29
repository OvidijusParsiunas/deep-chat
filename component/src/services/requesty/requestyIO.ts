import {INVALID_REQUEST_ERROR_PREFIX, AUTHENTICATION_ERROR_PREFIX} from '../utils/serviceConstants';
import {DirectConnection} from '../../types/directConnection';
import {DEEP_COPY} from '../../utils/consts/messageConstants';
import {ChatCompletionsIO} from '../utils/chatCompletionsIO';
import {RequestyChat} from '../../types/requesty';
import {APIKey} from '../../types/APIKey';
import {DeepChat} from '../../deepChat';
import {
  CHAT_COMPLETIONS_BUILD_HEADERS,
  CHAT_COMPLETIONS_BUILD_KEY_VERIFICATION_DETAILS,
} from '../utils/chatCompletionsUtils';

// https://docs.requesty.ai/
export class RequestyIO extends ChatCompletionsIO {
  override insertKeyPlaceholderText = this.genereteAPIKeyName('Requesty');
  override keyHelpUrl = 'https://app.requesty.ai/api-keys';
  url = 'https://router.requesty.ai/v1/chat/completions';
  permittedErrorPrefixes = [INVALID_REQUEST_ERROR_PREFIX, AUTHENTICATION_ERROR_PREFIX];

  constructor(deepChat: DeepChat) {
    const config = (DEEP_COPY(deepChat.directConnection) as DirectConnection).requesty;
    const keyVerificationDetails = CHAT_COMPLETIONS_BUILD_KEY_VERIFICATION_DETAILS('https://router.requesty.ai/v1/models');
    const functionHandler = (deepChat.directConnection?.requesty as RequestyChat)?.function_handler;
    super(deepChat, keyVerificationDetails, CHAT_COMPLETIONS_BUILD_HEADERS, config as APIKey, config, functionHandler);
    this.rawBody.model ??= 'openai/gpt-4o';
    this.rawBody.max_tokens ??= 1000;
  }
}
