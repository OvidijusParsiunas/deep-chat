import {MessageUtils} from '../../views/chat/messages/utils/messageUtils';
import {DirectConnection} from '../../types/directConnection';
import {MessageLimitUtils} from '../utils/messageLimitUtils';
import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {Response as ResponseI} from '../../types/response';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {DirectServiceIO} from '../utils/directServiceIO';
import {Stream} from '../../utils/HTTP/stream';
import {GrokUtils} from './utils/grokUtils';
import {GrokChat} from '../../types/grok';
import {APIKey} from '../../types/APIKey';
import {DeepChat} from '../../deepChat';

type GrokMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

type GrokRequestBody = {
  model: string;
  messages: GrokMessage[];
  max_tokens?: number;
  temperature?: number;
  stream?: boolean;
};

type GrokResponse = {
  id: string;
  object: 'chat.completion';
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: 'assistant';
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  error?: {
    message: string;
    type: string;
  };
};

type GrokStreamEvent = {
  id: string;
  object: 'chat.completion.chunk';
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      role?: 'assistant';
      content?: string;
    };
    finish_reason?: string;
  }>;
  error?: {
    message: string;
    type: string;
  };
};

type GrokAPIResult = GrokResponse | GrokStreamEvent;

export class GrokChatIO extends DirectServiceIO {
  override insertKeyPlaceholderText = 'Grok API Key';
  override keyHelpUrl = 'https://console.x.ai/team/default/api-keys';
  url = 'https://api.x.ai/v1/chat/completions';
  permittedErrorPrefixes = ['invalid_request_error', 'authentication_error'];
  private readonly _systemMessage: string = 'You are a helpful assistant.';

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = JSON.parse(JSON.stringify(deepChat.directConnection)) as DirectConnection;
    const apiKey = directConnectionCopy.grok;
    super(deepChat, GrokUtils.buildKeyVerificationDetails(), GrokUtils.buildHeaders, apiKey);
    const config = directConnectionCopy.grok?.chat;
    if (typeof config === 'object') {
      if (config.system_prompt) this._systemMessage = config.system_prompt;
      this.cleanConfig(config);
      Object.assign(this.rawBody, config);
    }
    this.maxMessages ??= -1;
    this.rawBody.model ??= 'grok-3-latest';
  }

  private cleanConfig(config: GrokChat & APIKey) {
    delete config.system_prompt;
    delete config.key;
  }

  private preprocessBody(body: GrokRequestBody, pMessages: MessageContentI[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body)) as GrokRequestBody;
    const processedMessages = MessageLimitUtils.getCharacterLimitMessages(
      pMessages,
      this.totalMessagesMaxCharLength ? this.totalMessagesMaxCharLength - this._systemMessage.length : -1
    ).map((message) => {
      return {
        content: message.text || '',
        role: message.role === MessageUtils.USER_ROLE ? 'user' : 'assistant',
      } as GrokMessage;
    });

    const systemMessage: GrokMessage = {
      role: 'system',
      content: this._systemMessage,
    };

    bodyCopy.messages = [systemMessage, ...processedMessages];
    return bodyCopy;
  }

  override async callServiceAPI(messages: Messages, pMessages: MessageContentI[]) {
    if (!this.connectSettings) throw new Error('Request settings have not been set up');
    const body = this.preprocessBody(this.rawBody, pMessages);
    const stream = this.stream;
    if ((stream && (typeof stream !== 'object' || !stream.simulation)) || body.stream) {
      body.stream = true;
      Stream.request(this, body, messages);
    } else {
      HTTPRequest.request(this, body, messages);
    }
  }

  override async extractResultData(result: GrokAPIResult): Promise<ResponseI> {
    if (result.error) throw result.error.message;

    // Handle streaming response
    if (result.object === 'chat.completion.chunk') {
      const choice = result.choices?.[0];
      if (choice?.delta?.content) {
        return {text: choice.delta.content};
      }
      return {text: ''};
    }

    // Handle non-streaming response
    if (result.object === 'chat.completion' && result.choices?.[0]?.message) {
      return {text: result.choices[0].message.content || ''};
    }

    return {text: ''};
  }
}
