import {GEMINI_BUILD_HEADERS, GEMINI_BUILD_KEY_VERIFICATION_DETAILS} from './utils/geminiUtils';
import {ERROR, FILES, SRC, TEXT, USER} from '../../utils/consts/messageConstants';
import {GeminiContent, GeminiRequestBody} from '../../types/geminiInternal';
import {GeminiGenerateContentResult} from '../../types/geminiResult';
import {DirectConnection} from '../../types/directConnection';
import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {DirectServiceIO} from '../utils/directServiceIO';
import {OBJECT} from '../utils/serviceConstants';
import {StreamConfig} from '../../types/stream';
import {Stream} from '../../utils/HTTP/stream';
import {Response} from '../../types/response';
import {Gemini} from '../../types/gemini';
import {APIKey} from '../../types/APIKey';
import {DeepChat} from '../../deepChat';
import {
  FUNCTION_TOOL_RESPONSE_STRUCTURE_ERROR,
  DEFINE_FUNCTION_HANDLER,
  REQUEST_SETTINGS_ERROR,
} from '../../utils/errorMessages/errorMessages';

// https://ai.google.dev/api/generate-content#method:-models.generatecontent
// https://ai.google.dev/gemini-api/docs/text-generation
// https://ai.google.dev/gemini-api/docs/models
export class GeminiIO extends DirectServiceIO {
  override insertKeyPlaceholderText = this.genereteAPIKeyName('Gemini');
  override keyHelpUrl = 'https://aistudio.google.com/app/apikey';
  urlPrefix = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
  url = '';
  permittedErrorPrefixes = ['API_KEY_INVALID'];

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = JSON.parse(JSON.stringify(deepChat.directConnection)) as DirectConnection;
    const config = directConnectionCopy.gemini as Gemini & APIKey;
    super(deepChat, GEMINI_BUILD_KEY_VERIFICATION_DETAILS(), GEMINI_BUILD_HEADERS, config);
    if (typeof config === OBJECT) {
      if (config.model) {
        this.urlPrefix = `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent`;
      }
      this.cleanConfig(config);
      this.completeConfig(config, (deepChat.directConnection?.gemini as Gemini)?.function_handler);
    }
    this.maxMessages ??= -1;
  }

  private cleanConfig(config: Gemini & APIKey) {
    delete config.model;
  }

  private static getContent(message: MessageContentI): GeminiContent {
    const parts: GeminiContent['parts'] = [];

    if (message[TEXT] && message[TEXT].trim().length > 0) {
      parts.push({[TEXT]: message[TEXT]});
    }

    if (message[FILES] && message[FILES].length > 0) {
      message[FILES].forEach((file) => {
        if (file[SRC] && file[SRC].includes('data:')) {
          const [mimeType, data] = file[SRC].split(',');
          parts.push({
            inlineData: {
              mimeType: mimeType.replace('data:', '').replace(';base64', ''),
              data,
            },
          });
        }
      });
    }

    return {
      parts,
      role: message.role === USER ? USER : 'model',
    };
  }

  private preprocessBody(body: GeminiRequestBody, pMessages: MessageContentI[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body));
    const processedMessages = this.processMessages(pMessages).map((message) => GeminiIO.getContent(message));
    bodyCopy.contents = processedMessages;
    if (this.systemMessage) bodyCopy.systemInstruction = {parts: [{[TEXT]: this.systemMessage}]};
    return bodyCopy;
  }

  override async callServiceAPI(messages: Messages, pMessages: MessageContentI[]) {
    if (!this.connectSettings) throw new Error(REQUEST_SETTINGS_ERROR);
    this.messages ??= messages;
    const body = this.preprocessBody(this.rawBody, pMessages);
    const stream = this.stream;
    if ((stream && (typeof stream !== OBJECT || !(stream as StreamConfig).simulation)) || body.stream) {
      // https://ai.google.dev/api/generate-content#method:-models.streamgeneratecontent
      // https://www.googlecloudcommunity.com/gc/AI-ML/streamGenerateContent-Method-of-Gemini-Rest-APIs-giving-multiple/
      // m-p/713681?lightbox-message-images-771198=116842i602BA042C49F4979
      this.url = `${this.urlPrefix.replace(':generateContent', ':streamGenerateContent')}?alt=sse&key=${this.key}`;
      Stream.request(this, body, messages);
    } else {
      this.url = `${this.urlPrefix}?key=${this.key}`;
      HTTPRequest.request(this, body, messages);
    }
  }

  // https://ai.google.dev/gemini-api/docs/function-calling?example=weather
  override async extractResultData(result: GeminiGenerateContentResult, prevBody?: Gemini): Promise<Response> {
    if (result[ERROR]) throw result[ERROR].message || 'Gemini API Error';
    if (result.candidates?.[0]?.content?.parts) {
      const parts = result.candidates[0].content.parts;

      const functionCall = parts.find((part) => part.functionCall);
      if (functionCall?.functionCall) {
        return this.handleTools([functionCall.functionCall], prevBody);
      }

      const textPart = parts.find((part) => part[TEXT]);
      const imagePart = parts.find((part) => part.inlineData?.mimeType === 'image/png');

      return {
        [TEXT]: textPart?.[TEXT] || '',
        [FILES]: imagePart?.inlineData?.data ? [{[SRC]: `data:image/png;base64,${imagePart.inlineData.data}`}] : [],
      };
    }
    return {[TEXT]: ''};
  }

  private async handleTools(functionCalls: {name: string; args: object}[], prevBody?: Gemini): Promise<Response> {
    if (!functionCalls || !prevBody || !this.functionHandler) {
      throw Error(DEFINE_FUNCTION_HANDLER);
    }
    const bodyCp = JSON.parse(JSON.stringify(prevBody));
    const functions = functionCalls.map((call) => {
      return {name: call.name, arguments: JSON.stringify(call.args)};
    });
    const {responses, processedResponse} = await this.callToolFunction(this.functionHandler, functions);
    if (processedResponse) return processedResponse;

    const assistantContent: GeminiContent = {
      parts: functionCalls.map((call) => ({
        functionCall: {
          name: call.name,
          args: call.args,
        },
      })),
      role: 'model',
    };

    bodyCp.contents.push(assistantContent);

    if (!responses.find(({response}) => typeof response !== 'string') && functions.length === responses.length) {
      const functionResponseContent: GeminiContent = {
        parts: responses.map((resp, index) => ({
          functionResponse: {
            name: functionCalls[index].name,
            response: {
              result: resp.response,
            },
          },
        })),
        role: USER,
      };

      bodyCp.contents.push(functionResponseContent);

      return this.makeAnotherRequest(bodyCp, this.messages);
    }
    throw Error(FUNCTION_TOOL_RESPONSE_STRUCTURE_ERROR);
  }
}
