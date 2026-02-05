import {DEFINE_FUNCTION_HANDLER, FUNCTION_TOOL_RESPONSE_STRUCTURE_ERROR} from '../../utils/errorMessages/errorMessages';
import {ASSISTANT, DEEP_COPY, ERROR, FILES, IMAGE, IMAGES, ROLE, SRC, TEXT} from '../../utils/consts/messageConstants';
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
  private static readonly THINK_END = '</think>';
  override insertKeyPlaceholderText = '';
  override keyHelpUrl = '';
  override validateKeyProperty = false;
  url = 'http://localhost:11434/api/chat';
  permittedErrorPrefixes = ['Error'];

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = DEEP_COPY(deepChat.directConnection) as DirectConnection;
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
    const bodyCopy = DEEP_COPY(body);
    const processedMessages = this.processMessages(pMessages).map((message) => {
      const ollamaMessage: OllamaMessage = {
        content: message[TEXT] || '',
        [ROLE]: DirectServiceIO.getRoleViaUser(message[ROLE]),
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

  private parseMessage(message: string): OllamaStreamResult[] {
    return message
      .split('\n')
      .filter((line) => line.trim())
      .map((line) => JSON.parse(line) as OllamaStreamResult);
  }

  override async extractResultData(result: OllamaConverseResult, prevBody?: OllamaChat): Promise<ResponseI> {
    if (result[ERROR]) throw result[ERROR].message;

    if (result[TEXT]) {
      const parsedStreamBodies = this.parseMessage(result[TEXT]);
      const responses: ResponseI[] = [];
      for (const parsedStreamBody of parsedStreamBodies) {
        if (parsedStreamBody.message?.tool_calls) {
          responses.push(await this.handleTools({tool_calls: parsedStreamBody.message.tool_calls}, prevBody));
        }
        responses.push({[TEXT]: parsedStreamBody.message?.content || ''});
      }
      const texts = responses.map((r) => r[TEXT]);
      const thinkIndex = texts.lastIndexOf(OllamaIO.THINK_END);
      if (thinkIndex === -1 || prevBody?.think) {
        return {[TEXT]: texts.join('')};
      } else {
        return {[TEXT]: texts.slice(thinkIndex + 1).join(''), overwrite: true};
      }
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
    const bodyCp = DEEP_COPY(prevBody);
    const functions = tools.tool_calls.map((call) => {
      return {name: call.function.name, arguments: JSON.stringify(call.function.arguments)};
    });
    const {responses, processedResponse} = await this.callToolFunction(this.functionHandler, functions);
    if (processedResponse) return processedResponse;

    bodyCp.messages.push({tool_calls: tools.tool_calls, [ROLE]: ASSISTANT, content: ''});
    if (!responses.find(({response}) => typeof response !== 'string') && functions.length === responses.length) {
      responses.forEach((resp, index) => {
        const toolCall = tools.tool_calls?.[index];
        bodyCp?.messages.push({
          [ROLE]: 'tool',
          tool_name: toolCall?.function.name,
          content: resp.response,
        });
      });

      return this.makeAnotherRequest(bodyCp, this.messages);
    }
    throw Error(FUNCTION_TOOL_RESPONSE_STRUCTURE_ERROR);
  }
}
