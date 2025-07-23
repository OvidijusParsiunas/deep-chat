import {MessageUtils} from '../../views/chat/messages/utils/messageUtils';
import {DirectConnection} from '../../types/directConnection';
import {MessageLimitUtils} from '../utils/messageLimitUtils';
import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {Response as ResponseI} from '../../types/response';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {DirectServiceIO} from '../utils/directServiceIO';
import {OpenRouterUtils} from './utils/openRouterUtils';
import {OpenRouter} from '../../types/openRouter';
import {Stream} from '../../utils/HTTP/stream';
import {APIKey} from '../../types/APIKey';
import {DeepChat} from '../../deepChat';

type OpenRouterMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

type OpenRouterRequestBody = {
  model: string;
  messages: OpenRouterMessage[];
  stream?: boolean;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
};

type OpenRouterResponse = {
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
    code?: string;
  };
};

type OpenRouterStreamEvent = {
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
    code?: string;
  };
};

type OpenRouterAPIResult = OpenRouterResponse | OpenRouterStreamEvent;

export class OpenRouterIO extends DirectServiceIO {
  override insertKeyPlaceholderText = 'OpenRouter API Key';
  override keyHelpUrl = 'https://openrouter.ai/keys';
  url = 'https://openrouter.ai/api/v1/chat/completions';
  permittedErrorPrefixes = ['invalid_request_error', 'authentication_error'];
  private readonly _systemMessage: string = 'You are a helpful assistant.';

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = JSON.parse(JSON.stringify(deepChat.directConnection)) as DirectConnection;
    const apiKey = directConnectionCopy.openRouter;
    super(deepChat, OpenRouterUtils.buildKeyVerificationDetails(), OpenRouterUtils.buildHeaders, apiKey);
    const config = directConnectionCopy.openRouter;
    if (typeof config === 'object') {
      if (config.system_prompt) this._systemMessage = config.system_prompt;
      this.cleanConfig(config);
      Object.assign(this.rawBody, config);
    }
    this.maxMessages ??= -1;
    this.rawBody.model ??= 'openai/gpt-4o';
    this.rawBody.max_tokens ??= 1000;
  }

  private cleanConfig(config: OpenRouter & APIKey) {
    delete config.system_prompt;
    delete config.key;
  }

  private preprocessBody(body: OpenRouterRequestBody, pMessages: MessageContentI[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body)) as OpenRouterRequestBody;
    const processedMessages = MessageLimitUtils.getCharacterLimitMessages(
      pMessages,
      this.totalMessagesMaxCharLength ? this.totalMessagesMaxCharLength - this._systemMessage.length : -1
    ).map((message) => {
      return {
        content: message.text || '',
        role: message.role === MessageUtils.USER_ROLE ? 'user' : 'assistant',
      } as OpenRouterMessage;
    });

    const messages: OpenRouterMessage[] = [];
    if (this._systemMessage) {
      messages.push({role: 'system', content: this._systemMessage});
    }
    messages.push(...processedMessages);

    bodyCopy.messages = messages;
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

  override async extractResultData(result: OpenRouterAPIResult): Promise<ResponseI> {
    if (result.error) throw result.error.message;

    // Handle streaming events
    if (result.object === 'chat.completion.chunk') {
      const choice = result.choices?.[0];
      if (choice?.delta?.content) {
        return {text: choice.delta.content};
      }
      return {text: ''};
    }

    // Handle non-streaming response
    if (result.object === 'chat.completion') {
      const choice = result.choices?.[0];
      if (choice?.message?.content) {
        return {text: choice.message.content};
      }
    }

    return {text: ''};
  }
}
