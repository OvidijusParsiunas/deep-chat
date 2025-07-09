import {MessageUtils} from '../../views/chat/messages/utils/messageUtils';
import {GeminiGenerateContentResult} from '../../types/geminiResult';
import {DirectConnection} from '../../types/directConnection';
import {MessageLimitUtils} from '../utils/messageLimitUtils';
import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {DirectServiceIO} from '../utils/directServiceIO';
import {GeminiUtils} from './utils/geminiUtils';
import {Stream} from '../../utils/HTTP/stream';
import {Response} from '../../types/response';
import {Gemini} from '../../types/gemini';
import {APIKey} from '../../types/APIKey';
import {DeepChat} from '../../deepChat';

type GeminiContent = {
  parts: {
    text?: string;
    inlineData?: {
      mimeType: string;
      data: string;
    };
  }[];
  role?: string;
};

type GeminiRequestBody = {
  contents: GeminiContent[];
  systemInstruction?: {
    parts: {text: string}[];
  };
  generationConfig?: {
    maxOutputTokens?: number;
    temperature?: number;
    topP?: number;
    topK?: number;
    stopSequences?: string[];
    responseMimeType?: string;
    responseSchema?: object;
  };
};

// https://ai.google.dev/api/generate-content
export class GeminiIO extends DirectServiceIO {
  override insertKeyPlaceholderText = 'Gemini API Key';
  override keyHelpUrl = 'https://aistudio.google.com/app/apikey';
  urlPrefix = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
  url = '';
  permittedErrorPrefixes = ['API_KEY_INVALID'];
  private readonly _systemInstruction?: string;

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = JSON.parse(JSON.stringify(deepChat.directConnection)) as DirectConnection;
    const apiKey = directConnectionCopy.gemini;
    const config = directConnectionCopy.gemini;
    let systemInstruction: string | undefined;

    super(deepChat, GeminiUtils.buildKeyVerificationDetails(), GeminiUtils.buildHeaders, apiKey);

    if (!config) return;
    if (config.systemInstruction) systemInstruction = config.systemInstruction;
    if (config.model) {
      this.urlPrefix = `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent`;
    }

    Object.defineProperty(this, '_systemInstruction', {value: systemInstruction, writable: false});

    this.cleanConfig(config);
    Object.assign(this.rawBody, config);
    this.maxMessages ??= -1;
  }

  private cleanConfig(config: Gemini & APIKey) {
    delete config.systemInstruction;
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
              data: data,
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
    this.url = `${this.urlPrefix}?key=${this.key}`;
    const body = this.preprocessBody(this.rawBody, pMessages);
    const stream = this.stream;
    if ((stream && (typeof stream !== 'object' || !stream.simulation)) || body.stream) {
      body.stream = true;
      Stream.request(this, body, messages);
    } else {
      HTTPRequest.request(this, body, messages);
    }
  }

  override async extractResultData(result: GeminiGenerateContentResult): Promise<Response> {
    if (result.error) throw result.error.message || 'Gemini API Error';
    if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
      return {text: result.candidates[0].content.parts[0].text};
    }
    return {text: ''};
  }
}
