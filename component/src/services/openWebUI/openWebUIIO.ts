import {DEFINE_FUNCTION_HANDLER, FUNCTION_TOOL_RESPONSE_STRUCTURE_ERROR} from '../../utils/errorMessages/errorMessages';
import {OpenWebUIConverseResult, OpenWebUIStreamResult, OpenWebUIToolCall} from '../../types/openWebUIResult';
import {OPEN_WEB_UI_BUILD_HEADERS, OPEN_WEB_UI_BUILD_KEY_VERIFICATION_DETAILS} from './utils/openWebUIUtils';
import {OpenWebUIConverseBodyInternal, OpenWebUIMessage} from '../../types/openWebUIInternal';
import {ASSISTANT, ERROR, FILES, ROLE, TEXT} from '../../utils/consts/messageConstants';
import {DirectConnection} from '../../types/directConnection';
import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {Response as ResponseI} from '../../types/response';
import {DirectServiceIO} from '../utils/directServiceIO';
import {OpenWebUIChat} from '../../types/openWebUI';
import {OBJECT} from '../utils/serviceConstants';
import {APIKey} from '../../types/APIKey';
import {DeepChat} from '../../deepChat';

export class OpenWebUIIO extends DirectServiceIO {
  override insertKeyPlaceholderText = 'Open WebUI API Key';
  override keyHelpUrl = 'https://docs.openwebui.com/getting-started/api-endpoints/';
  url = 'http://localhost:3000/api/chat/completions';
  permittedErrorPrefixes = ['Error'];

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = JSON.parse(JSON.stringify(deepChat.directConnection)) as DirectConnection;
    const config = directConnectionCopy.openWebUI as OpenWebUIChat & APIKey;
    super(deepChat, OPEN_WEB_UI_BUILD_KEY_VERIFICATION_DETAILS(), OPEN_WEB_UI_BUILD_HEADERS, config);
    if (typeof config === OBJECT) {
      this.completeConfig(config, (deepChat.directConnection?.openWebUI as OpenWebUIChat)?.function_handler);
      // Add files from configuration to the request body
      if (config[FILES] && config[FILES].length > 0) {
        this.rawBody[FILES] = config[FILES];
      }
    }
    this.maxMessages ??= -1;
    this.rawBody.model ??= 'llama3.2';
    this.rawBody.stream ??= false;
  }

  private preprocessBody(body: OpenWebUIConverseBodyInternal, pMessages: MessageContentI[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body));

    const processedMessages = this.processMessages(pMessages).map((message) => {
      const openWebUIMessage: OpenWebUIMessage = {
        content: DirectServiceIO.getTextWImagesContent(message),
        [ROLE]: DirectServiceIO.getRoleViaUser(message[ROLE]),
      };
      return openWebUIMessage;
    });

    this.addSystemMessage(processedMessages);
    bodyCopy.messages = processedMessages;
    // Files are handled through the configuration, not individual messages
    // The files array is already set in rawBody from config during construction
    return bodyCopy;
  }

  override async callServiceAPI(messages: Messages, pMessages: MessageContentI[]) {
    this.messages ??= messages;
    this.callDirectServiceServiceAPI(messages, pMessages, this.preprocessBody.bind(this), {readable: true});
  }

  override async extractResultData(result: OpenWebUIConverseResult, prevBody?: OpenWebUIChat): Promise<ResponseI> {
    if (result[ERROR]) throw result[ERROR].message;

    // streaming
    if (result[TEXT]) {
      const textData = result[TEXT].trim();
      return this.processStreamingResponse(textData, prevBody);
    }

    // standard
    if (result.choices && result.choices[0]?.message) {
      const message = result.choices[0].message;
      if (message.tool_calls) {
        return this.handleTools({tool_calls: message.tool_calls}, prevBody);
      }
      return {[TEXT]: message.content || ''};
    }

    return {[TEXT]: ''};
  }

  private async processStreamingResponse(textData: string, prevBody?: OpenWebUIChat): Promise<ResponseI> {
    const lines = textData.split('\n').filter((line) => line.trim() !== '');
    let combinedContent = '';

    for (const line of lines) {
      let cleanLine = line.trim();
      // Remove 'data: ' prefix from SSE format
      if (cleanLine.startsWith('data: ')) cleanLine = cleanLine.substring(6);
      if (cleanLine === '[DONE]') continue;

      try {
        const parsedStreamBody = JSON.parse(cleanLine) as OpenWebUIStreamResult;
        if (parsedStreamBody.choices && parsedStreamBody.choices[0]?.delta) {
          const delta = parsedStreamBody.choices[0].delta;
          if (delta.tool_calls) {
            return this.handleTools({tool_calls: delta.tool_calls}, prevBody);
          }
          if (delta.content) {
            combinedContent += delta.content;
          }
        }
      } catch (_e) {
        // Skip malformed chunks
        continue;
      }
    }

    return {[TEXT]: combinedContent};
  }

  private async handleTools(tools: {tool_calls: OpenWebUIToolCall[]}, prevBody?: OpenWebUIChat): Promise<ResponseI> {
    if (!tools.tool_calls || !prevBody || !this.functionHandler) {
      throw Error(DEFINE_FUNCTION_HANDLER);
    }
    const bodyCp = JSON.parse(JSON.stringify(prevBody));
    const functions = tools.tool_calls.map((call) => {
      return {name: call.function.name, arguments: call.function.arguments};
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
