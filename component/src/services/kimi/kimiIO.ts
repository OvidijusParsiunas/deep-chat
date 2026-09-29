import {
  CHAT_COMPLETIONS_BUILD_HEADERS,
  CHAT_COMPLETIONS_BUILD_KEY_VERIFICATION_DETAILS,
} from '../utils/chatCompletionsUtils';
import {DirectConnection} from '../../types/directConnection';
import {DEEP_COPY} from '../../utils/consts/messageConstants';
import {MessageContentI} from '../../types/messagesInternal';
import {INVALID_ERROR_PREFIX} from '../utils/serviceConstants';
import {ChatCompletionsIO} from '../utils/chatCompletionsIO';
import {KimiChat} from '../../types/kimi';
import {APIKey} from '../../types/APIKey';
import {DeepChat} from '../../deepChat';

// https://platform.moonshot.ai/docs/api/chat#chat-completion
export class KimiIO extends ChatCompletionsIO {
  override insertKeyPlaceholderText = this.genereteAPIKeyName('Kimi');
  override keyHelpUrl = 'https://platform.moonshot.ai/console/api-keys';
  url = 'https://api.moonshot.ai/v1/chat/completions';
  permittedErrorPrefixes = [INVALID_ERROR_PREFIX, 'Not found'];

  constructor(deepChat: DeepChat) {
    const config = (DEEP_COPY(deepChat.directConnection) as DirectConnection).kimi;
    const keyVerificationDetails = CHAT_COMPLETIONS_BUILD_KEY_VERIFICATION_DETAILS('https://api.moonshot.ai/v1/models');
    const functionHandler = (deepChat.directConnection?.kimi as KimiChat)?.function_handler;
    super(deepChat, keyVerificationDetails, CHAT_COMPLETIONS_BUILD_HEADERS, config as APIKey, config, functionHandler);
    this.rawBody.model ??= 'moonshot-v1-8k';
  }

  protected override getContent(message: MessageContentI) {
    return ChatCompletionsIO.getTextWImagesContent(message);
  }
}
