import {
  CHAT_COMPLETIONS_BUILD_HEADERS,
  CHAT_COMPLETIONS_BUILD_KEY_VERIFICATION_DETAILS,
} from '../utils/chatCompletionsUtils';
import {AUTHENTICATION_ERROR_PREFIX, INVALID_REQUEST_ERROR_PREFIX} from '../utils/serviceConstants';
import {DEEP_COPY, TEXT} from '../../utils/consts/messageConstants';
import {DirectConnection} from '../../types/directConnection';
import {MessageContentI} from '../../types/messagesInternal';
import {ChatCompletionsIO} from '../utils/chatCompletionsIO';
import {APIKey} from '../../types/APIKey';
import {DeepChat} from '../../deepChat';

// https://platform.deepseek.com/api-docs/
export class DeepSeekIO extends ChatCompletionsIO {
  override insertKeyPlaceholderText = this.genereteAPIKeyName('DeepSeek');
  override keyHelpUrl = 'https://platform.deepseek.com/api_keys';
  url = 'https://api.deepseek.com/v1/chat/completions';
  permittedErrorPrefixes = [INVALID_REQUEST_ERROR_PREFIX, AUTHENTICATION_ERROR_PREFIX];

  constructor(deepChat: DeepChat) {
    const config = (DEEP_COPY(deepChat.directConnection) as DirectConnection).deepSeek;
    const keyVerificationDetails = CHAT_COMPLETIONS_BUILD_KEY_VERIFICATION_DETAILS('https://api.deepseek.com/models');
    super(deepChat, keyVerificationDetails, CHAT_COMPLETIONS_BUILD_HEADERS, config as APIKey, config);
    this.rawBody.model ??= 'deepseek-chat';
    this.rawBody.temperature ??= 1;
    this.rawBody.max_tokens ??= 4096;
  }

  protected override getContent(message: MessageContentI) {
    return message[TEXT] || '';
  }
}
