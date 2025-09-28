import {GroqResult, GroqToolCall, ToolAPI, GroqChoice} from '../../types/groqResult';
import {GroqMessage, GroqRequestBody, GroqContent} from '../../types/groqInternal';
import {INVALID_ERROR_PREFIX, OBJECT} from '../utils/serviceConstants';
import {ErrorMessages} from '../../utils/errorMessages/errorMessages';
import {DirectConnection} from '../../types/directConnection';
import {MessageLimitUtils} from '../utils/messageLimitUtils';
import {MessageContentI} from '../../types/messagesInternal';
import {TEXT_KEY} from '../../utils/consts/messageConstants';
import {Messages} from '../../views/chat/messages/messages';
import {Response as ResponseI} from '../../types/response';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {DirectServiceIO} from '../utils/directServiceIO';
import {ChatFunctionHandler} from '../../types/openAI';
import {MessageFile} from '../../types/messageFile';
import {StreamConfig} from '../../types/stream';
import {Stream} from '../../utils/HTTP/stream';
import {GroqUtils} from './utils/groqUtils';
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
  private _streamToolCalls?: GroqToolCall[];
  private readonly _systemMessage: string = '';
  private _messages?: Messages;

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = JSON.parse(JSON.stringify(deepChat.directConnection)) as DirectConnection;
    const apiKey = directConnectionCopy.groq;
    super(deepChat, GroqUtils.buildKeyVerificationDetails(), GroqUtils.buildHeaders, apiKey);
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

  private static getImageContent(files: MessageFile[]): GroqContent[] {
    return files
      .filter((file) => file.type === 'image')
      .map((file) => ({
        type: 'image_url' as const,
        image_url: {
          url: file.src || '',
        },
      }))
      .filter((content) => content.image_url.url.length > 0);
  }

  private static getContent(message: MessageContentI): string | GroqContent[] {
    if (message.files && message.files.length > 0) {
      const content: GroqContent[] = GroqChatIO.getImageContent(message.files);
      if (message.text && message.text.trim().length > 0) {
        content.unshift({type: 'text', [TEXT_KEY]: message.text});
      }
      return content.length > 0 ? content : message.text || '';
    }
    return message.text || '';
  }

  private preprocessBody(body: GroqRequestBody, pMessages: MessageContentI[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body)) as GroqRequestBody;
    const processedMessages: GroqMessage[] = MessageLimitUtils.getCharacterLimitMessages(
      pMessages,
      this.totalMessagesMaxCharLength ? this.totalMessagesMaxCharLength - this._systemMessage.length : -1
    ).map((message) => {
      return {
        content: GroqChatIO.getContent(message),
        role: message.role === 'ai' ? ('assistant' as const) : (message.role as 'user'),
      };
    });
    if (this._systemMessage) {
      processedMessages.unshift({role: 'system', content: this._systemMessage});
    }
    bodyCopy.messages = processedMessages;
    return bodyCopy;
  }

  override async callServiceAPI(messages: Messages, pMessages: MessageContentI[]) {
    this._messages ??= messages;
    this.callDirectServiceServiceAPI(messages, pMessages, this.preprocessBody, {});
  }

  override async extractResultData(result: GroqResult, prevBody?: GroqRequestBody): Promise<ResponseI> {
    if (result.error) throw result.error.message;
    if (result.choices?.[0]?.delta) {
      return this.extractStreamResult(result.choices[0], prevBody);
    }
    if (result.choices?.[0]?.message) {
      if (result.choices[0].message.tool_calls) {
        return this.handleTools(result.choices[0].message, prevBody);
      }
      return {[TEXT_KEY]: result.choices[0].message.content || ''};
    }
    return {[TEXT_KEY]: ''};
  }

  private async extractStreamResult(choice: GroqChoice, prevBody?: GroqRequestBody) {
    const {delta, finish_reason} = choice;
    if (finish_reason === 'tool_calls') {
      const tools = {tool_calls: this._streamToolCalls};
      this._streamToolCalls = undefined;
      return this.handleTools(tools, prevBody);
    } else if (delta?.tool_calls) {
      if (!this._streamToolCalls) {
        this._streamToolCalls = delta.tool_calls;
      } else {
        delta.tool_calls.forEach((tool, index) => {
          if (this._streamToolCalls) this._streamToolCalls[index].function.arguments += tool.function.arguments;
        });
      }
    }
    return {[TEXT_KEY]: delta?.content || ''};
  }

  // https://console.groq.com/docs/tool-use
  private async handleTools(tools: ToolAPI, prevBody?: GroqRequestBody): Promise<ResponseI> {
    if (!tools.tool_calls || !prevBody || !this._functionHandler) {
      throw Error(ErrorMessages.DEFINE_FUNCTION_HANDLER);
    }
    const bodyCp = JSON.parse(JSON.stringify(prevBody));
    const functions = tools.tool_calls.map((call) => {
      return {name: call.function.name, arguments: call.function.arguments};
    });
    const {responses, processedResponse} = await this.callToolFunction(this._functionHandler, functions);
    if (processedResponse) return processedResponse;

    // When making a tool call, only using latest user prompt as for some reason on multiple requests it responds to first
    bodyCp.messages = bodyCp.messages.slice(bodyCp.messages.length - 1);
    if (this._systemMessage) bodyCp.messages.unshift({role: 'system', content: this._systemMessage});
    bodyCp.messages.push({tool_calls: tools.tool_calls, role: 'assistant', content: null});
    if (!responses.find(({response}) => typeof response !== 'string') && functions.length === responses.length) {
      responses.forEach((resp, index) => {
        const toolCall = tools.tool_calls?.[index];
        bodyCp?.messages.push({
          role: 'tool',
          tool_call_id: toolCall?.id,
          name: toolCall?.function.name,
          content: resp.response,
        });
      });

      return this.makeAnotherRequest(bodyCp, this._messages);
    }
    throw Error('Function tool response must be an array or contain a text property');
  }
}
