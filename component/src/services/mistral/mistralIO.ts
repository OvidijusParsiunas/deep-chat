import {MistralMessage, MistralRequestBody, MistralContentItem} from '../../types/mistralInternal';
import {INVALID_ERROR_PREFIX, OBJECT} from '../utils/serviceConstants';
import {DirectConnection} from '../../types/directConnection';
import {MessageLimitUtils} from '../utils/messageLimitUtils';
import {MessageContentI} from '../../types/messagesInternal';
import {TEXT_KEY} from '../../utils/consts/messageConstants';
import {Messages} from '../../views/chat/messages/messages';
import {DirectServiceIO} from '../utils/directServiceIO';
import {MistralResult} from '../../types/mistralResult';
import {ChatFunctionHandler} from '../../types/openAI';
import {MessageFile} from '../../types/messageFile';
import {MistralUtils} from './utils/mistralUtils';
import {Response} from '../../types/response';
import {Mistral} from '../../types/mistral';
import {APIKey} from '../../types/APIKey';
import {DeepChat} from '../../deepChat';

// https://docs.mistral.ai/api/
export class MistralIO extends DirectServiceIO {
  override insertKeyPlaceholderText = this.genereteAPIKeyName('Mistral');
  override keyHelpUrl = 'https://console.mistral.ai/api-keys/';
  url = 'https://api.mistral.ai/v1/chat/completions';
  permittedErrorPrefixes = [INVALID_ERROR_PREFIX];
  _functionHandler?: ChatFunctionHandler;
  private readonly _systemMessage: string = '';
  private _messages?: Messages;

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = JSON.parse(JSON.stringify(deepChat.directConnection)) as DirectConnection;
    const config = directConnectionCopy.mistral as Mistral & APIKey;
    super(deepChat, MistralUtils.buildKeyVerificationDetails(), MistralUtils.buildHeaders, config);
    if (typeof config === OBJECT) {
      if (config.system_prompt) this._systemMessage = config.system_prompt;
      const function_handler = deepChat.directConnection?.mistral?.function_handler;
      if (function_handler) this._functionHandler = function_handler;
      this.cleanConfig(config);
      Object.assign(this.rawBody, config);
    }
    this.maxMessages ??= -1;
    this.rawBody.model ??= 'mistral-small-latest';
  }

  private cleanConfig(config: Mistral & APIKey) {
    delete config.system_prompt;
    delete config.function_handler;
    delete config.key;
  }

  private static getFileContent(files: MessageFile[]): MistralContentItem[] {
    return files.map((file) => {
      if (file.type === 'image') {
        return {type: 'image_url', image_url: file.src || ''};
      }
      return {type: 'text', [TEXT_KEY]: `[Unsupported file type: ${file.type}]`};
    });
  }

  private preprocessBody(body: MistralRequestBody, pMessages: MessageContentI[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body)) as MistralRequestBody;
    const processedMessages: MistralMessage[] = MessageLimitUtils.getCharacterLimitMessages(
      pMessages,
      this.totalMessagesMaxCharLength ? this.totalMessagesMaxCharLength - this._systemMessage.length : -1
    ).map((message) => ({
      role: DirectServiceIO.getRoleViaAI(message.role),
      content: DirectServiceIO.getTextWFilesContent(message, MistralIO.getFileContent),
    }));
    if (this._systemMessage) processedMessages.unshift({role: 'system', content: this._systemMessage});
    bodyCopy.messages = processedMessages;
    return bodyCopy;
  }

  override async callServiceAPI(messages: Messages, pMessages: MessageContentI[]) {
    this._messages ??= messages;
    this.callDirectServiceServiceAPI(messages, pMessages, this.preprocessBody.bind(this), {});
  }

  override async extractResultData(result: MistralResult, prevBody?: Mistral): Promise<Response> {
    if (result.message) throw result.message;
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

  private async extractStreamResult(choice: MistralResult['choices'][0], prevBody?: Mistral) {
    const {delta, finish_reason} = choice;
    if (finish_reason === 'tool_calls' && delta?.tool_calls) {
      const tools = {tool_calls: delta.tool_calls};
      // https://docs.mistral.ai/api/#tag/chat/operation/chat_completion_v1_chat_completions_post
      return this.handleToolsGeneric(tools, this._functionHandler, this._messages, prevBody);
    }
    return {[TEXT_KEY]: delta?.content || ''};
  }
}
