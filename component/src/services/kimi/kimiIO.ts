import {KimiRequestBody, KimiMessage, KimiToolCall} from '../../types/kimiInternal';
import {MessageUtils} from '../../views/chat/messages/utils/messageUtils';
import {INVALID_ERROR_PREFIX, OBJECT} from '../utils/serviceConstants';
import {DirectConnection} from '../../types/directConnection';
import {MessageLimitUtils} from '../utils/messageLimitUtils';
import {MessageContentI} from '../../types/messagesInternal';
import {TEXT_KEY} from '../../utils/consts/messageConstants';
import {Messages} from '../../views/chat/messages/messages';
import {Response as ResponseI} from '../../types/response';
import {DirectServiceIO} from '../utils/directServiceIO';
import {ChatFunctionHandler} from '../../types/openAI';
import {KimiResult} from '../../types/kimiResult';
import {KimiUtils} from './utils/kimiUtils';
import {APIKey} from '../../types/APIKey';
import {DeepChat} from '../../deepChat';
import {Kimi} from '../../types/kimi';

// https://platform.moonshot.ai/docs/api/chat#chat-completion

export class KimiIO extends DirectServiceIO {
  override insertKeyPlaceholderText = this.genereteAPIKeyName('Kimi');
  override keyHelpUrl = 'https://platform.moonshot.ai/console/api-keys';
  url = 'https://api.moonshot.ai/v1/chat/completions';
  permittedErrorPrefixes = [INVALID_ERROR_PREFIX, 'Not found'];
  _functionHandler?: ChatFunctionHandler;
  readonly _streamToolCalls?: KimiToolCall[];
  private readonly _systemMessage: string = 'You are Kimi, a helpful assistant created by Moonshot AI.';
  private _messages?: Messages;

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = JSON.parse(JSON.stringify(deepChat.directConnection)) as DirectConnection;
    const config = directConnectionCopy.kimi as Kimi & APIKey;
    super(deepChat, KimiUtils.buildKeyVerificationDetails(), KimiUtils.buildHeaders, config);
    if (typeof config === OBJECT) {
      if (config.system_prompt) this._systemMessage = config.system_prompt;
      const function_handler = (deepChat.directConnection?.kimi as Kimi)?.function_handler;
      if (function_handler) this._functionHandler = function_handler;
      this.cleanConfig(config);
      Object.assign(this.rawBody, config);
    }
    this.maxMessages ??= -1;
    this.rawBody.model ??= 'moonshot-v1-8k';
  }

  private cleanConfig(config: Kimi & APIKey) {
    delete config.system_prompt;
    delete config.function_handler;
    delete config.key;
  }

  private preprocessBody(body: KimiRequestBody, pMessages: MessageContentI[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body)) as KimiRequestBody;
    const processedMessages = MessageLimitUtils.getCharacterLimitMessages(
      pMessages,
      this.totalMessagesMaxCharLength ? this.totalMessagesMaxCharLength - this._systemMessage.length : -1
    ).map((message) => {
      return {
        content: KimiIO.getTextWImagesContent(message),
        role: message.role === MessageUtils.USER_ROLE ? 'user' : 'assistant',
      } as KimiMessage;
    });

    bodyCopy.messages = [{role: 'system', content: this._systemMessage}, ...processedMessages];
    return bodyCopy;
  }

  override async callServiceAPI(messages: Messages, pMessages: MessageContentI[]) {
    this._messages ??= messages;
    this.callDirectServiceServiceAPI(messages, pMessages, this.preprocessBody.bind(this), {});
  }

  override async extractResultData(result: KimiResult, prevBody?: Kimi): Promise<ResponseI> {
    if (result.error) throw result.error.message;

    if (result.choices && result.choices.length > 0) {
      const choice = result.choices[0];

      if (choice.delta) {
        return this.extractStreamResult(choice, prevBody);
      }

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

  private async extractStreamResult(choice: KimiResult['choices'][0], prevBody?: Kimi) {
    return this.extractStreamResultWToolsGeneric(this, choice, this._functionHandler, this._messages, prevBody);
  }
}
