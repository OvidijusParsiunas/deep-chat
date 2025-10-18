import {DEFINE_FUNCTION_HANDLER, FUNCTION_TOOL_RESPONSE_STRUCTURE_ERROR} from '../../utils/errorMessages/errorMessages';
import {OllamaConverseBodyInternal, OllamaToolCall, OllamaMessage} from '../../types/ollamaInternal';
import {ASSISTANT, ERROR, FILES, IMAGE, IMAGES, TEXT} from '../../utils/consts/messageConstants';
import {OLLAMA_BUILD_HEADERS, OLLAMA_BUILD_KEY_VERIFICATION_DETAILS} from './utils/ollamaUtils';
import {OllamaConverseResult, OllamaStreamResult} from '../../types/ollamaResult';
import {DirectConnection} from '../../types/directConnection';
import {MessageLimitUtils} from '../utils/messageLimitUtils';
import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {Response as ResponseI} from '../../types/response';
import {DirectServiceIO} from '../utils/directServiceIO';
import {ChatFunctionHandler} from '../../types/openAI';
import {MessageFile} from '../../types/messageFile';
import {OBJECT} from '../utils/serviceConstants';
import {OllamaChat} from '../../types/ollama';
import {DeepChat} from '../../deepChat';

export class OllamaIO extends DirectServiceIO {
  override insertKeyPlaceholderText = '';
  override keyHelpUrl = '';
  override validateKeyProperty = false;
  url = 'http://localhost:11434/api/chat';
  permittedErrorPrefixes = ['Error'];
  private readonly _systemMessage: string = '';
  _functionHandler?: ChatFunctionHandler;
  private _messages?: Messages;

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = JSON.parse(JSON.stringify(deepChat.directConnection)) as DirectConnection;
    super(deepChat, OLLAMA_BUILD_KEY_VERIFICATION_DETAILS(), OLLAMA_BUILD_HEADERS, {key: 'placeholder'});
    const config = directConnectionCopy.ollama as OllamaChat;
    if (typeof config === OBJECT) {
      if (config.system) this._systemMessage = config.system;
      const function_handler = (deepChat.directConnection?.ollama as OllamaChat)?.function_handler;
      if (function_handler) this._functionHandler = function_handler;
      this.cleanConfig(config);
      Object.assign(this.rawBody, config);
    }
    this.maxMessages ??= -1;
    this.rawBody.model ??= 'llama3.2';
    this.rawBody.stream ??= false;
  }

  private cleanConfig(config: OllamaChat) {
    delete config.system;
    delete config.function_handler;
  }

  private static getImageData(files: MessageFile[]): string[] {
    return files
      .filter((file) => file.type === IMAGE)
      .map((file) => {
        const base64Data = file.src?.split(',')[1];
        return base64Data || '';
      })
      .filter((data) => data.length > 0);
  }

  private preprocessBody(body: OllamaConverseBodyInternal, pMessages: MessageContentI[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body));
    const processedMessages = MessageLimitUtils.getCharacterLimitMessages(
      pMessages,
      this.totalMessagesMaxCharLength ? this.totalMessagesMaxCharLength - this._systemMessage.length : -1
    ).map((message) => {
      const ollamaMessage: OllamaMessage = {
        content: message[TEXT] || '',
        role: DirectServiceIO.getRoleViaUser(message.role),
      };

      if (message[FILES] && message[FILES].length > 0) {
        const images = OllamaIO.getImageData(message[FILES]);
        if (images.length > 0) {
          ollamaMessage[IMAGES] = images;
        }
      }

      return ollamaMessage;
    });
    if (this._systemMessage) processedMessages.unshift({role: 'system', content: this._systemMessage});
    bodyCopy.messages = processedMessages;
    return bodyCopy;
  }

  override async callServiceAPI(messages: Messages, pMessages: MessageContentI[]) {
    this._messages ??= messages;
    this.callDirectServiceServiceAPI(messages, pMessages, this.preprocessBody.bind(this), {readable: true});
  }

  override async extractResultData(result: OllamaConverseResult, prevBody?: OllamaChat): Promise<ResponseI> {
    if (result[ERROR]) throw result[ERROR].message;

    if (result[TEXT]) {
      const parsedStreamBody = JSON.parse(result[TEXT]) as OllamaStreamResult;
      if (parsedStreamBody.message?.tool_calls) {
        return this.handleTools({tool_calls: parsedStreamBody.message.tool_calls}, prevBody);
      }
      return {[TEXT]: parsedStreamBody.message?.content || ''};
    }

    if (result.message) {
      if (result.message.tool_calls) {
        return this.handleTools({tool_calls: result.message.tool_calls}, prevBody);
      }
      return {[TEXT]: result.message.content || ''};
    }

    return {[TEXT]: ''};
  }

  private async handleTools(tools: {tool_calls: OllamaToolCall[]}, prevBody?: OllamaChat): Promise<ResponseI> {
    if (!tools.tool_calls || !prevBody || !this._functionHandler) {
      throw Error(DEFINE_FUNCTION_HANDLER);
    }
    const bodyCp = JSON.parse(JSON.stringify(prevBody));
    const functions = tools.tool_calls.map((call) => {
      return {name: call.function.name, arguments: JSON.stringify(call.function.arguments)};
    });
    const {responses, processedResponse} = await this.callToolFunction(this._functionHandler, functions);
    if (processedResponse) return processedResponse;

    bodyCp.messages.push({tool_calls: tools.tool_calls, role: ASSISTANT, content: ''});
    if (!responses.find(({response}) => typeof response !== 'string') && functions.length === responses.length) {
      responses.forEach((resp, index) => {
        const toolCall = tools.tool_calls?.[index];
        bodyCp?.messages.push({
          role: 'tool',
          tool_name: toolCall?.function.name,
          content: resp.response,
        });
      });

      return this.makeAnotherRequest(bodyCp, this._messages);
    }
    throw Error(FUNCTION_TOOL_RESPONSE_STRUCTURE_ERROR);
  }
}
