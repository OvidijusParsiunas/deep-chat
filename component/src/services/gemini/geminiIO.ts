import {GeminiContent, GeminiRequestBody} from '../../types/geminiInternal';
import {MessageUtils} from '../../views/chat/messages/utils/messageUtils';
import {ErrorMessages} from '../../utils/errorMessages/errorMessages';
import {GeminiGenerateContentResult} from '../../types/geminiResult';
import {DirectConnection} from '../../types/directConnection';
import {MessageLimitUtils} from '../utils/messageLimitUtils';
import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {DirectServiceIO} from '../utils/directServiceIO';
import {ChatFunctionHandler} from '../../types/openAI';
import {GeminiUtils} from './utils/geminiUtils';
import {Stream} from '../../utils/HTTP/stream';
import {Response} from '../../types/response';
import {Gemini} from '../../types/gemini';
import {APIKey} from '../../types/APIKey';
import {DeepChat} from '../../deepChat';

// https://ai.google.dev/api/generate-content#method:-models.generatecontent
// https://ai.google.dev/gemini-api/docs/text-generation
export class GeminiIO extends DirectServiceIO {
  override insertKeyPlaceholderText = 'Gemini API Key';
  override keyHelpUrl = 'https://aistudio.google.com/app/apikey';
  urlPrefix = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
  url = '';
  permittedErrorPrefixes = ['API_KEY_INVALID'];
  private readonly _systemInstruction?: string;
  _functionHandler?: ChatFunctionHandler;
  private _messages?: Messages;

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = JSON.parse(JSON.stringify(deepChat.directConnection)) as DirectConnection;
    const config = directConnectionCopy.gemini;
    super(deepChat, GeminiUtils.buildKeyVerificationDetails(), GeminiUtils.buildHeaders, config);
    if (typeof config === 'object') {
      if (config.systemInstruction) this._systemInstruction = config.systemInstruction;
      const {function_handler} = deepChat.directConnection?.gemini as Gemini;
      if (function_handler) this._functionHandler = function_handler;
      if (config.model) {
        this.urlPrefix = `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent`;
      }
      this.cleanConfig(config);
    }
    Object.assign(this.rawBody, config);
    this.maxMessages ??= -1;
  }

  private cleanConfig(config: Gemini & APIKey) {
    delete config.systemInstruction;
    delete config.function_handler;
    delete config.model;
    delete config.key;
  }

  private static getContent(message: MessageContentI): GeminiContent {
    const parts: GeminiContent['parts'] = [];

    if (message.text && message.text.trim().length > 0) {
      parts.push({text: message.text});
    }

    if (message.files && message.files.length > 0) {
      message.files.forEach((file) => {
        if (file.src && file.src.includes('data:')) {
          const [mimeType, data] = file.src.split(',');
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
      role: message.role === MessageUtils.USER_ROLE ? 'user' : 'model',
    };
  }

  // prettier-ignore
  private preprocessBody(body: GeminiRequestBody, pMessages: MessageContentI[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body));
    const processedMessages = MessageLimitUtils.getCharacterLimitMessages(pMessages,
        this.totalMessagesMaxCharLength ? this.totalMessagesMaxCharLength - (this._systemInstruction?.length || 0) : -1)
      .map((message) => GeminiIO.getContent(message));
    
    bodyCopy.contents = processedMessages;
    
    if (this._systemInstruction) {
      bodyCopy.systemInstruction = {
        parts: [{text: this._systemInstruction}]
      };
    }
    
    return bodyCopy;
  }

  override async callServiceAPI(messages: Messages, pMessages: MessageContentI[]) {
    if (!this.connectSettings) throw new Error('Request settings have not been set up');
    this._messages ??= messages;
    const body = this.preprocessBody(this.rawBody, pMessages);
    const stream = this.stream;
    if ((stream && (typeof stream !== 'object' || !stream.simulation)) || body.stream) {
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
    if (result.error) throw result.error.message || 'Gemini API Error';
    if (result.candidates?.[0]?.content?.parts) {
      const parts = result.candidates[0].content.parts;

      const functionCall = parts.find((part) => part.functionCall);
      if (functionCall?.functionCall) {
        return this.handleTools([functionCall.functionCall], prevBody);
      }

      const textPart = parts.find((part) => part.text);
      const imagePart = parts.find((part) => part.inlineData?.mimeType === 'image/png');

      return {
        text: textPart?.text || '',
        files: imagePart?.inlineData?.data ? [{src: `data:image/png;base64,${imagePart.inlineData.data}`}] : [],
      };
    }
    return {text: ''};
  }

  private async handleTools(functionCalls: {name: string; args: object}[], prevBody?: Gemini): Promise<Response> {
    if (!functionCalls || !prevBody || !this._functionHandler) {
      throw Error(ErrorMessages.DEFINE_FUNCTION_HANDLER);
    }
    const bodyCp = JSON.parse(JSON.stringify(prevBody));
    const functions = functionCalls.map((call) => {
      return {name: call.name, arguments: JSON.stringify(call.args)};
    });
    const {responses, processedResponse} = await this.callToolFunction(this._functionHandler, functions);
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
        role: 'user',
      };

      bodyCp.contents.push(functionResponseContent);

      return this.makeAnotherRequest(bodyCp, this._messages);
    }
    throw Error('Function tool response must be an array or contain a text property');
  }
}
