import {QWEN_BUILD_HEADERS, QWEN_BUILD_KEY_VERIFICATION_DETAILS} from './utils/qwenUtils';
import {QwenRequestBody, QwenMessage, QwenToolCall} from '../../types/qwenInternal';
import {INCORRECT_ERROR_PREFIX, OBJECT} from '../utils/serviceConstants';
import {ERROR, TEXT} from '../../utils/consts/messageConstants';
import {DirectConnection} from '../../types/directConnection';
import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {Response as ResponseI} from '../../types/response';
import {DirectServiceIO} from '../utils/directServiceIO';
import {QwenResult} from '../../types/qwenResult';
import {APIKey} from '../../types/APIKey';
import {DeepChat} from '../../deepChat';
import {Qwen} from '../../types/qwen';

// https://www.alibabacloud.com/help/en/model-studio/use-qwen-by-calling-api
export class QwenIO extends DirectServiceIO {
  override insertKeyPlaceholderText = this.genereteAPIKeyName('Qwen');
  override keyHelpUrl = 'https://www.alibabacloud.com/help/en/model-studio/get-api-key';
  url = 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions';
  permittedErrorPrefixes = ['No static', 'The model', INCORRECT_ERROR_PREFIX];
  readonly _streamToolCalls?: QwenToolCall[];

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = JSON.parse(JSON.stringify(deepChat.directConnection)) as DirectConnection;
    const config = directConnectionCopy.qwen as Qwen & APIKey;
    super(deepChat, QWEN_BUILD_KEY_VERIFICATION_DETAILS(), QWEN_BUILD_HEADERS, config);
    if (typeof config === OBJECT) {
      this.completeConfig(config, (deepChat.directConnection?.qwen as Qwen)?.function_handler);
    }
    this.maxMessages ??= -1;
    this.rawBody.model ??= 'qwen-plus';
  }

  private preprocessBody(body: QwenRequestBody, pMessages: MessageContentI[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body)) as QwenRequestBody;
    const processedMessages = this.processMessages(pMessages).map((message) => {
      return {
        content: QwenIO.getTextWImagesContent(message),
        role: DirectServiceIO.getRoleViaUser(message.role),
      } as QwenMessage;
    });
    this.addSystemMessage(processedMessages);
    bodyCopy.messages = processedMessages;
    return bodyCopy;
  }

  override async callServiceAPI(messages: Messages, pMessages: MessageContentI[]) {
    this.messages ??= messages;
    this.callDirectServiceServiceAPI(messages, pMessages, this.preprocessBody.bind(this), {});
  }

  override async extractResultData(result: QwenResult, prevBody?: Qwen): Promise<ResponseI> {
    if (result[ERROR]) throw result[ERROR].message;

    if (result.choices && result.choices.length > 0) {
      const choice = result.choices[0];

      // Handle streaming response
      if (choice.delta) {
        return this.extractStreamResult(choice, prevBody);
      }

      // Handle non-streaming response
      if (choice.message) {
        if (choice.message.tool_calls) {
          return this.handleToolsGeneric(
            {tool_calls: choice.message.tool_calls},
            this.functionHandler,
            this.messages,
            prevBody
          );
        }
        return {[TEXT]: choice.message.content || ''};
      }
    }

    return {[TEXT]: ''};
  }

  private async extractStreamResult(choice: QwenResult['choices'][0], prevBody?: Qwen) {
    return this.extractStreamResultWToolsGeneric(this, choice, this.functionHandler, prevBody);
  }
}
