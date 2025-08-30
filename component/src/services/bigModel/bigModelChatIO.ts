import {BigModelResult, BigModelNormalResult, BigModelStreamEvent} from '../../types/bigModelResult';
import {MessageElements, Messages} from '../../views/chat/messages/messages';
import {ErrorMessages} from '../../utils/errorMessages/errorMessages';
import {DirectConnection} from '../../types/directConnection';
import {MessageLimitUtils} from '../utils/messageLimitUtils';
import {MessageContentI} from '../../types/messagesInternal';
import {Response as ResponseI} from '../../types/response';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {DirectServiceIO} from '../utils/directServiceIO';
import {ChatFunctionHandler} from '../../types/openAI';
import {BigModelUtils} from './utils/bigModelUtils';
import {MessageFile} from '../../types/messageFile';
import {BigModelChat} from '../../types/bigModel';
import {Stream} from '../../utils/HTTP/stream';
import {APIKey} from '../../types/APIKey';
import {DeepChat} from '../../deepChat';
import {
  BigModelRequestBody,
  BigModelContentItem,
  BigModelUserMessage,
  BigModelToolCall,
  BigModelMessage,
} from '../../types/bigModelInternal';

// https://docs.bigmodel.cn/api-reference/%E6%A8%A1%E5%9E%8B-api/%E5%AF%B9%E8%AF%9D%E8%A1%A5%E5%85%A8
export class BigModelChatIO extends DirectServiceIO {
  override insertKeyPlaceholderText = 'BigModel API Key';
  override keyHelpUrl = 'https://open.bigmodel.cn/usercenter/apikeys';
  url = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
  permittedErrorPrefixes = ['Authorization', 'authentication_error'];
  _functionHandler?: ChatFunctionHandler;
  private _messages?: Messages;
  private readonly _systemMessage: string = 'You are a helpful assistant.';

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = JSON.parse(JSON.stringify(deepChat.directConnection)) as DirectConnection;
    const apiKey = directConnectionCopy.bigModel;
    super(deepChat, BigModelUtils.buildKeyVerificationDetails(), BigModelUtils.buildHeaders, apiKey);
    const config = directConnectionCopy.bigModel?.chat;
    if (typeof config === 'object') {
      if (config.system_prompt) this._systemMessage = config.system_prompt;
      const function_handler = (deepChat.directConnection?.bigModel?.chat as BigModelChat)?.function_handler;
      if (function_handler) this._functionHandler = function_handler;
      this.cleanConfig(config);
      Object.assign(this.rawBody, config);
    }
    this.maxMessages ??= -1;
    this.rawBody.model ??= 'glm-4.5';
  }

  private cleanConfig(config: BigModelChat & APIKey) {
    delete config.system_prompt;
    delete config.function_handler;
    delete config.key;
  }

  private static getFileContent(files: MessageFile[]): BigModelContentItem[] {
    return files.map((file) => {
      if (file.type === 'image') {
        return {type: 'image_url', image_url: {url: file.src || ''}};
      }
      return {type: 'file', file_url: {url: file.src || ''}};
    });
  }

  private static getContent(message: MessageContentI): string | BigModelContentItem[] {
    if (message.files && message.files.length > 0) {
      const content: BigModelContentItem[] = BigModelChatIO.getFileContent(message.files);
      if (message.text && message.text.trim().length > 0) {
        content.unshift({type: 'text', text: message.text});
      }
      return content;
    }
    return message.text || '';
  }

  private preprocessBody(body: BigModelRequestBody, pMessages: MessageContentI[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body)) as BigModelRequestBody;
    const processedMessages: BigModelMessage[] = MessageLimitUtils.getCharacterLimitMessages(
      pMessages,
      this.totalMessagesMaxCharLength ? this.totalMessagesMaxCharLength - this._systemMessage.length : -1
    ).map((message) => {
      return {
        content: BigModelChatIO.getContent(message),
        role: message.role === 'ai' ? 'assistant' : 'user',
      } as BigModelUserMessage;
    });
    if (this._systemMessage) {
      processedMessages.unshift({role: 'system', content: this._systemMessage});
    }
    bodyCopy.messages = processedMessages;
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

  override async extractResultData(result: BigModelResult, prevBody?: BigModelChat): Promise<ResponseI> {
    if (result.error) throw result.error.message;
    if (result.choices.length > 0) {
      if ((result.choices[0] as BigModelStreamEvent).delta !== undefined) {
        return this.extractStreamResult(result.choices[0] as BigModelStreamEvent, prevBody);
      }
      if ((result.choices[0] as BigModelNormalResult).message !== undefined) {
        const message = (result.choices[0] as BigModelNormalResult).message;
        if (message.tool_calls) {
          return this.handleTools({tool_calls: message.tool_calls}, prevBody);
        }
        return {text: message.content};
      }
    }
    return {text: ''};
  }

  private async extractStreamResult(choice: BigModelStreamEvent, prevBody?: BigModelChat) {
    const {delta, finish_reason} = choice;
    const lastMessage = this._messages?.messageToElements[this._messages.messageToElements.length - 2];
    // This is used when AI responds first responds with something like "Let me think about this"
    // and then creates a new stream with the actual result. The problem is that the first
    // message can sometimes be completely empty which does not look good in the UI.
    // To repeat this behaviour, ask for something twice in same chat
    if (lastMessage?.[0].role === 'ai' && lastMessage?.[0].text?.replace(/\n/g, '').trim().length === 0) {
      this._messages?.removeMessage(lastMessage[1].text as MessageElements);
      this._messages?.messageToElements.splice(this._messages.messageToElements.length - 2, 1);
    }

    if (finish_reason === 'tool_calls') {
      if (delta.tool_calls) {
        const tools = {tool_calls: delta.tool_calls};
        return this.handleTools(tools, prevBody);
      }
      return {text: delta?.content || ''};
    }
    return {text: delta?.content || ''};
  }

  private async handleTools(tools: {tool_calls?: BigModelToolCall[]}, prevBody?: BigModelChat): Promise<ResponseI> {
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
