import {QwenRequestBody, QwenMessage, QwenToolCall, QwenContent} from '../../types/qwenInternal';
import {MessageUtils} from '../../views/chat/messages/utils/messageUtils';
import {ErrorMessages} from '../../utils/errorMessages/errorMessages';
import {DirectConnection} from '../../types/directConnection';
import {MessageLimitUtils} from '../utils/messageLimitUtils';
import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {Response as ResponseI} from '../../types/response';
import {QwenResult, ToolAPI} from '../../types/qwenResult';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {DirectServiceIO} from '../utils/directServiceIO';
import {ChatFunctionHandler} from '../../types/openAI';
import {MessageFile} from '../../types/messageFile';
import {Stream} from '../../utils/HTTP/stream';
import {QwenUtils} from './utils/qwenUtils';
import {APIKey} from '../../types/APIKey';
import {DeepChat} from '../../deepChat';
import {Qwen} from '../../types/qwen';

// https://www.alibabacloud.com/help/en/model-studio/use-qwen-by-calling-api
export class QwenIO extends DirectServiceIO {
  override insertKeyPlaceholderText = 'Qwen API Key';
  override keyHelpUrl = 'https://www.alibabacloud.com/help/en/model-studio/get-api-key';
  url = 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions';
  permittedErrorPrefixes = ['No static', 'The model', 'Incorrect'];
  _functionHandler?: ChatFunctionHandler;
  private _streamToolCalls?: QwenToolCall[];
  private readonly _systemMessage: string = 'You are a helpful assistant.';
  private _messages?: Messages;

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = JSON.parse(JSON.stringify(deepChat.directConnection)) as DirectConnection;
    const config = directConnectionCopy.qwen;
    super(deepChat, QwenUtils.buildKeyVerificationDetails(), QwenUtils.buildHeaders, config);
    if (typeof config === 'object') {
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

  private static getImageContent(files: MessageFile[]): QwenContent[] {
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

  private static getContent(message: MessageContentI): string | QwenContent[] {
    if (message.files && message.files.length > 0) {
      const content: QwenContent[] = QwenIO.getImageContent(message.files);
      if (message.text && message.text.trim().length > 0) {
        content.unshift({type: 'text', text: message.text});
      }
      return content.length > 0 ? content : message.text || '';
    }
    return message.text || '';
  }

  private preprocessBody(body: QwenRequestBody, pMessages: MessageContentI[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body)) as QwenRequestBody;
    const processedMessages = MessageLimitUtils.getCharacterLimitMessages(
      pMessages,
      this.totalMessagesMaxCharLength ? this.totalMessagesMaxCharLength - this._systemMessage.length : -1
    ).map((message) => {
      return {
        content: QwenIO.getContent(message),
        role: message.role === MessageUtils.USER_ROLE ? 'user' : 'assistant',
      } as QwenMessage;
    });

    bodyCopy.messages = [{role: 'system', content: this._systemMessage}, ...processedMessages];
    return bodyCopy;
  }

  override async callServiceAPI(messages: Messages, pMessages: MessageContentI[]) {
    if (!this.connectSettings) throw new Error('Request settings have not been set up');
    this._messages ??= messages;
    const body = this.preprocessBody(this.rawBody, pMessages);
    const stream = this.stream;
    if ((stream && (typeof stream !== 'object' || !stream.simulation)) || body.stream) {
      body.stream = true;
      Stream.request(this, body, messages);
    } else {
      HTTPRequest.request(this, body, messages);
    }
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
          return this.handleTools({tool_calls: choice.message.tool_calls}, prevBody);
        }
        return {text: choice.message.content || ''};
      }
    }

    return {text: ''};
  }

  private async extractStreamResult(choice: QwenResult['choices'][0], prevBody?: Qwen) {
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
    return {text: delta?.content || ''};
  }

  private async handleTools(tools: ToolAPI, prevBody?: Qwen): Promise<ResponseI> {
    if (!tools.tool_calls || !prevBody || !this._functionHandler) {
      throw Error(ErrorMessages.DEFINE_FUNCTION_HANDLER);
    }
    const bodyCp = JSON.parse(JSON.stringify(prevBody));
    const functions = tools.tool_calls.map((call) => {
      return {name: call.function.name, arguments: call.function.arguments};
    });
    const {responses, processedResponse} = await this.callToolFunction(this._functionHandler, functions);
    if (processedResponse) return processedResponse;

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
