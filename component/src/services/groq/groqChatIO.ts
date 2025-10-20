import {GROQ_BUILD_HEADERS, GROQ_BUILD_KEY_VERIFICATION_DETAILS} from './utils/groqUtils';
import {AI, ASSISTANT, ERROR, TEXT} from '../../utils/consts/messageConstants';
import {GroqResult, GroqToolCall, GroqChoice} from '../../types/groqResult';
import {INVALID_ERROR_PREFIX, OBJECT} from '../utils/serviceConstants';
import {GroqMessage, GroqRequestBody} from '../../types/groqInternal';
import {DirectConnection} from '../../types/directConnection';
import {MessageLimitUtils} from '../utils/messageLimitUtils';
import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {Response as ResponseI} from '../../types/response';
import {DirectServiceIO} from '../utils/directServiceIO';
import {ChatFunctionHandler} from '../../types/openAI';
import {GroqChat} from '../../types/groq';
import {APIKey} from '../../types/APIKey';
import {DeepChat} from '../../deepChat';

// https://console.groq.com/docs/api-reference#chat-create
export class GroqChatIO extends DirectServiceIO {
  override insertKeyPlaceholderText = this.genereteAPIKeyName('Groq');
  override keyHelpUrl = 'https://console.groq.com/keys';
  url = 'https://api.groq.com/openai/v1/chat/completions';
  permittedErrorPrefixes = [INVALID_ERROR_PREFIX, 'property'];
  _functionHandler?: ChatFunctionHandler;
  _streamToolCalls?: GroqToolCall[];
  private readonly _systemMessage: string = '';

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = JSON.parse(JSON.stringify(deepChat.directConnection)) as DirectConnection;
    const apiKey = directConnectionCopy.groq;
    super(deepChat, GROQ_BUILD_KEY_VERIFICATION_DETAILS(), GROQ_BUILD_HEADERS, apiKey);
    const config = directConnectionCopy.groq?.chat as GroqChat;
    if (typeof config === OBJECT) {
      if (config.system_prompt) this._systemMessage = config.system_prompt;
      const function_handler = (deepChat.directConnection?.groq?.chat as GroqChat)?.function_handler;
      if (function_handler) this._functionHandler = function_handler;
      this.cleanConfig(config);
      Object.assign(this.rawBody, config);
    }
    this.maxMessages ??= -1;
    this.rawBody.model ??= 'llama-3.3-70b-versatile';
  }

  private cleanConfig(config: GroqChat & APIKey) {
    delete config.system_prompt;
    delete config.function_handler;
    delete config.key;
  }

  private preprocessBody(body: GroqRequestBody, pMessages: MessageContentI[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body)) as GroqRequestBody;
    const processedMessages: GroqMessage[] = MessageLimitUtils.getCharacterLimitMessages(
      pMessages,
      this.totalMessagesMaxCharLength ? this.totalMessagesMaxCharLength - this._systemMessage.length : -1
    ).map((message) => {
      return {
        content: GroqChatIO.getTextWImagesContent(message),
        role: message.role === AI ? ASSISTANT : (message.role as 'user'),
      };
    });
    if (this._systemMessage) processedMessages.unshift({role: 'system', content: this._systemMessage});
    bodyCopy.messages = processedMessages;
    return bodyCopy;
  }

  override async callServiceAPI(messages: Messages, pMessages: MessageContentI[]) {
    this.messages ??= messages;
    this.callDirectServiceServiceAPI(messages, pMessages, this.preprocessBody.bind(this), {});
  }

  override async extractResultData(result: GroqResult, prevBody?: GroqRequestBody): Promise<ResponseI> {
    if (result[ERROR]) throw result[ERROR].message;
    if (result.choices?.[0]?.delta) {
      return this.extractStreamResult(result.choices[0], prevBody);
    }
    if (result.choices?.[0]?.message) {
      if (result.choices[0].message.tool_calls) {
        // Only using latest user prompt as for some reason on multiple requests it responds to first
        return this.handleToolsGeneric(result.choices[0].message, this._functionHandler, this.messages, prevBody, {
          message: this._systemMessage,
        });
      }
      return {[TEXT]: result.choices[0].message.content || ''};
    }
    return {[TEXT]: ''};
  }

  // https://console.groq.com/docs/tool-use
  private async extractStreamResult(choice: GroqChoice, prevBody?: GroqRequestBody) {
    return this.extractStreamResultWToolsGeneric(this, choice, this._functionHandler, prevBody);
  }
}
