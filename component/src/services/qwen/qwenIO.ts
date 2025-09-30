import {QwenRequestBody, QwenMessage, QwenToolCall} from '../../types/qwenInternal';
import {MessageUtils} from '../../views/chat/messages/utils/messageUtils';
import {INCORRECT_ERROR_PREFIX, OBJECT} from '../utils/serviceConstants';
import {DirectConnection} from '../../types/directConnection';
import {MessageLimitUtils} from '../utils/messageLimitUtils';
import {MessageContentI} from '../../types/messagesInternal';
import {TEXT_KEY} from '../../utils/consts/messageConstants';
import {Messages} from '../../views/chat/messages/messages';
import {Response as ResponseI} from '../../types/response';
import {DirectServiceIO} from '../utils/directServiceIO';
import {ChatFunctionHandler} from '../../types/openAI';
import {QwenResult} from '../../types/qwenResult';
import {QwenUtils} from './utils/qwenUtils';
import {APIKey} from '../../types/APIKey';
import {DeepChat} from '../../deepChat';
import {Qwen} from '../../types/qwen';

// https://www.alibabacloud.com/help/en/model-studio/use-qwen-by-calling-api
export class QwenIO extends DirectServiceIO {
  override insertKeyPlaceholderText = this.genereteAPIKeyName('Qwen');
  override keyHelpUrl = 'https://www.alibabacloud.com/help/en/model-studio/get-api-key';
  url = 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions';
  permittedErrorPrefixes = ['No static', 'The model', INCORRECT_ERROR_PREFIX];
  _functionHandler?: ChatFunctionHandler;
  readonly _streamToolCalls?: QwenToolCall[];
  private readonly _systemMessage: string = '';
  private _messages?: Messages;

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = JSON.parse(JSON.stringify(deepChat.directConnection)) as DirectConnection;
    const config = directConnectionCopy.qwen as Qwen & APIKey;
    super(deepChat, QwenUtils.buildKeyVerificationDetails(), QwenUtils.buildHeaders, config);
    if (typeof config === OBJECT) {
      if (config.system_prompt) this._systemMessage = config.system_prompt;
      const function_handler = (deepChat.directConnection?.qwen as Qwen)?.function_handler;
      if (function_handler) this._functionHandler = function_handler;
      this.cleanConfig(config);
      Object.assign(this.rawBody, config);
    }
    this.maxMessages ??= -1;
    this.rawBody.model ??= 'qwen-plus';
  }

  private cleanConfig(config: Qwen & APIKey) {
    delete config.system_prompt;
    delete config.function_handler;
    delete config.key;
  }

  private preprocessBody(body: QwenRequestBody, pMessages: MessageContentI[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body)) as QwenRequestBody;
    const processedMessages = MessageLimitUtils.getCharacterLimitMessages(
      pMessages,
      this.totalMessagesMaxCharLength ? this.totalMessagesMaxCharLength - this._systemMessage.length : -1
    ).map((message) => {
      return {
        content: QwenIO.getTextWImagesContent(message),
        role: message.role === MessageUtils.USER_ROLE ? 'user' : 'assistant',
      } as QwenMessage;
    });

    bodyCopy.messages = [{role: 'system', content: this._systemMessage}, ...processedMessages];
    return bodyCopy;
  }

  override async callServiceAPI(messages: Messages, pMessages: MessageContentI[]) {
    this._messages ??= messages;
    this.callDirectServiceServiceAPI(messages, pMessages, this.preprocessBody.bind(this), {});
  }

  override async extractResultData(result: QwenResult, prevBody?: Qwen): Promise<ResponseI> {
    if (result.error) throw result.error.message;

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
            this._functionHandler,
            this._messages,
            prevBody
          );
        }
        return {[TEXT_KEY]: choice.message.content || ''};
      }
    }

    return {[TEXT_KEY]: ''};
  }

  private async extractStreamResult(choice: QwenResult['choices'][0], prevBody?: Qwen) {
    return this.extractStreamResultWToolsGeneric(this, choice, this._functionHandler, this._messages, prevBody);
  }
}
