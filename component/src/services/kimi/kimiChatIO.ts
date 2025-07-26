import {MessageUtils} from '../../views/chat/messages/utils/messageUtils';
import {DirectConnection} from '../../types/directConnection';
import {MessageLimitUtils} from '../utils/messageLimitUtils';
import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {Response as ResponseI} from '../../types/response';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {DirectServiceIO} from '../utils/directServiceIO';
import {Stream} from '../../utils/HTTP/stream';
import {KimiUtils} from './utils/kimiUtils';
import {APIKey} from '../../types/APIKey';
import {DeepChat} from '../../deepChat';
import {Kimi} from '../../types/kimi';

type KimiMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

type KimiRequestBody = {
  model: string;
  messages: KimiMessage[];
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string | string[];
};

type KimiResponse = {
  id: string;
  object: 'chat.completion' | 'chat.completion.chunk';
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message?: {
      role: 'assistant';
      content: string;
    };
    delta?: {
      role?: 'assistant';
      content?: string;
    };
    finish_reason?: string;
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

// https://platform.moonshot.ai/docs/api/chat#chat-completion
export class KimiChatIO extends DirectServiceIO {
  override insertKeyPlaceholderText = 'Kimi AI API Key';
  override keyHelpUrl = 'https://platform.moonshot.ai/console/api-keys';
  url = 'https://api.moonshot.ai/v1/chat/completions';
  permittedErrorPrefixes = ['Invalid', 'Not found'];
  private readonly _systemMessage: string = 'You are Kimi, a helpful assistant created by Moonshot AI.';

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = JSON.parse(JSON.stringify(deepChat.directConnection)) as DirectConnection;
    const apiKey = directConnectionCopy.kimi;
    super(deepChat, KimiUtils.buildKeyVerificationDetails(), KimiUtils.buildHeaders, apiKey);
    const config = directConnectionCopy.kimi;
    if (typeof config === 'object') {
      if (config.system_prompt) this._systemMessage = config.system_prompt;
      this.cleanConfig(config);
      Object.assign(this.rawBody, config);
    }
    this.maxMessages ??= -1;
    this.rawBody.model ??= 'moonshot-v1-8k';
  }

  private cleanConfig(config: Kimi & APIKey) {
    delete config.system_prompt;
    delete config.key;
  }

  private preprocessBody(body: KimiRequestBody, pMessages: MessageContentI[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body)) as KimiRequestBody;
    const processedMessages = MessageLimitUtils.getCharacterLimitMessages(
      pMessages,
      this.totalMessagesMaxCharLength ? this.totalMessagesMaxCharLength - this._systemMessage.length : -1
    ).map((message) => {
      return {
        content: message.text || '',
        role: message.role === MessageUtils.USER_ROLE ? 'user' : 'assistant',
      } as KimiMessage;
    });

    bodyCopy.messages = [{role: 'system', content: this._systemMessage}, ...processedMessages];
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

  override async extractResultData(result: KimiResponse): Promise<ResponseI> {
    if (result.error) throw result.error.message;

    if (result.choices && result.choices.length > 0) {
      const choice = result.choices[0];

      if (choice.delta && choice.delta.content) {
        return {text: choice.delta.content};
      }

      if (choice.message && choice.message.content) {
        return {text: choice.message.content};
      }
    }

    return {text: ''};
  }
}
