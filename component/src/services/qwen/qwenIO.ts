import {
  CHAT_COMPLETIONS_BUILD_HEADERS,
  CHAT_COMPLETIONS_BUILD_KEY_VERIFICATION_DETAILS,
} from '../utils/chatCompletionsUtils';
import {INCORRECT_ERROR_PREFIX, INVALID_REQUEST_ERROR_PREFIX} from '../utils/serviceConstants';
import {DirectConnection} from '../../types/directConnection';
import {DEEP_COPY} from '../../utils/consts/messageConstants';
import {MessageContentI} from '../../types/messagesInternal';
import {ChatCompletionsIO} from '../utils/chatCompletionsIO';
import {QwenChat} from '../../types/qwen';
import {APIKey} from '../../types/APIKey';
import {DeepChat} from '../../deepChat';

// https://www.alibabacloud.com/help/en/model-studio/use-qwen-by-calling-api
export class QwenIO extends ChatCompletionsIO {
  override insertKeyPlaceholderText = this.genereteAPIKeyName('Qwen');
  override keyHelpUrl = 'https://www.alibabacloud.com/help/en/model-studio/get-api-key';
  url = 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions';
  permittedErrorPrefixes = ['No static', 'The model', INCORRECT_ERROR_PREFIX];

  constructor(deepChat: DeepChat) {
    const config = (DEEP_COPY(deepChat.directConnection) as DirectConnection).qwen;
    const keyVerificationDetails = CHAT_COMPLETIONS_BUILD_KEY_VERIFICATION_DETAILS(
      'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/models',
      INVALID_REQUEST_ERROR_PREFIX
    );
    const functionHandler = (deepChat.directConnection?.qwen as QwenChat)?.function_handler;
    super(deepChat, keyVerificationDetails, CHAT_COMPLETIONS_BUILD_HEADERS, config as APIKey, config, functionHandler);
    this.rawBody.model ??= 'qwen-plus';
  }

  protected override getContent(message: MessageContentI) {
    return ChatCompletionsIO.getTextWImagesContent(message);
  }
}
