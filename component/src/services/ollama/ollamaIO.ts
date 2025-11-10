import {DEFINE_FUNCTION_HANDLER, FUNCTION_TOOL_RESPONSE_STRUCTURE_ERROR} from '../../utils/errorMessages/errorMessages';
import {ASSISTANT, ERROR, FILES, IMAGE, IMAGES, SRC, TEXT} from '../../utils/consts/messageConstants';
import {OllamaConverseBodyInternal, OllamaToolCall, OllamaMessage} from '../../types/ollamaInternal';
import {OLLAMA_BUILD_HEADERS, OLLAMA_BUILD_KEY_VERIFICATION_DETAILS} from './utils/ollamaUtils';
import {OllamaConverseResult, OllamaStreamResult} from '../../types/ollamaResult';
import {DirectConnection} from '../../types/directConnection';
import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {Response as ResponseI} from '../../types/response';
import {DirectServiceIO} from '../utils/directServiceIO';
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

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = JSON.parse(JSON.stringify(deepChat.directConnection)) as DirectConnection;
    super(deepChat, OLLAMA_BUILD_KEY_VERIFICATION_DETAILS(), OLLAMA_BUILD_HEADERS, {key: 'placeholder'});
    const config = directConnectionCopy.ollama as OllamaChat;
    if (typeof config === OBJECT) {
      this.completeConfig(config, (deepChat.directConnection?.ollama as OllamaChat)?.function_handler);
    }
    this.maxMessages ??= -1;
    this.rawBody.model ??= 'llama3.2';
    this.rawBody.stream ??= false;
  }

  private static getImageData(files: MessageFile[]): string[] {
    return files
      .filter((file) => file.type === IMAGE)
      .map((file) => {
        const base64Data = file[SRC]?.split(',')[1];
        return base64Data || '';
      })
      .filter((data) => data.length > 0);
  }

  private preprocessBody(body: OllamaConverseBodyInternal, pMessages: MessageContentI[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body));
    const processedMessages = this.processMessages(pMessages).map((message) => {
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
    this.addSystemMessage(processedMessages);
    bodyCopy.messages = processedMessages;
    return bodyCopy;
  }

  override async callServiceAPI(messages: Messages, pMessages: MessageContentI[]) {
    this.messages ??= messages;
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
    if (!tools.tool_calls || !prevBody || !this.functionHandler) {
      throw Error(DEFINE_FUNCTION_HANDLER);
    }
    const bodyCp = JSON.parse(JSON.stringify(prevBody));
    const functions = tools.tool_calls.map((call) => {
      return {name: call.function.name, arguments: JSON.stringify(call.function.arguments)};
    });
    const {responses, processedResponse} = await this.callToolFunction(this.functionHandler, functions);
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

      return this.makeAnotherRequest(bodyCp, this.messages);
    }
    throw Error(FUNCTION_TOOL_RESPONSE_STRUCTURE_ERROR);
  }
}
