import {TOGETHER_BUILD_HEADERS, TOGETHER_BUILD_KEY_VERIFICATION_DETAILS} from './utils/togetherUtils';
import {AUTHENTICATION_ERROR_PREFIX, INVALID_REQUEST_ERROR_PREFIX} from '../utils/serviceConstants';
import {AI, ASSISTANT, DEEP_COPY, TEXT} from '../../utils/consts/messageConstants';
import {DirectConnection} from '../../types/directConnection';
import {MessageContentI} from '../../types/messagesInternal';
import {ChatCompletionsIO} from '../utils/chatCompletionsIO';
import {DeepChat} from '../../deepChat';

// https://docs.together.ai/reference/chat-completions-1
export class TogetherChatIO extends ChatCompletionsIO {
  override insertKeyPlaceholderText = this.genereteAPIKeyName('Together AI');
  override keyHelpUrl = 'https://api.together.xyz/settings/api-keys';
  url = 'https://api.together.xyz/v1/chat/completions';
  permittedErrorPrefixes = [INVALID_REQUEST_ERROR_PREFIX, AUTHENTICATION_ERROR_PREFIX];

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = DEEP_COPY(deepChat.directConnection) as DirectConnection;
    const config = directConnectionCopy.together?.chat;
    super(
      deepChat,
      TOGETHER_BUILD_KEY_VERIFICATION_DETAILS(),
      TOGETHER_BUILD_HEADERS,
      directConnectionCopy.together,
      config
    );
    this.rawBody.model ??= 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo';
  }

  protected override getRole(role: string) {
    return role === AI ? ASSISTANT : role;
  }

  protected override getContent(message: MessageContentI) {
    return message[TEXT] || '';
  }
}
