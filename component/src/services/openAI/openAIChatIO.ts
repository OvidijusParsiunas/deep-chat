import {CompletionsHandlers, KeyVerificationHandlers, ServiceIO, StreamHandlers} from '../serviceIO';
import {OpenAIConverseBodyInternal, SystemMessageInternal} from '../../types/openAIInternal';
import {ValidateMessageBeforeSending} from '../../types/validateMessageBeforeSending';
import {RequestInterceptor, ResponseInterceptor} from '../../types/interceptors';
import {RequestSettings, ServiceCallConfig} from '../../types/requestSettings';
import {OpenAIConverseBaseBody} from './utils/openAIConverseBaseBody';
import {OpenAI, OpenAICustomChatConfig} from '../../types/openAI';
import {OpenAIConverseResult} from '../../types/openAIResult';
import {MessageLimitUtils} from '../utils/messageLimitUtils';
import {Messages} from '../../views/chat/messages/messages';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {MessageContent} from '../../types/messages';
import {OpenAIUtils} from './utils/openAIUtils';
import {AiAssistant} from '../../aiAssistant';
import {Result} from '../../types/result';

// chat is a form of completions
export class OpenAIChatIO implements ServiceIO {
  url = 'https://api.openai.com/v1/chat/completions';
  requestSettings?: RequestSettings;
  requestInterceptor: RequestInterceptor = (details) => details;
  resposeInterceptor: ResponseInterceptor = (result) => result;
  canSendMessage: ValidateMessageBeforeSending = OpenAIChatIO.canSendMessage;
  private readonly _raw_body: OpenAIConverseBodyInternal;
  private readonly _systemMessage: SystemMessageInternal =
    OpenAIChatIO.generateSystemMessage('You are a helpful assistant.');
  private readonly _total_messages_max_char_length?: number;
  private readonly _max_messages?: number;

  constructor(aiAssistant: AiAssistant, key?: string) {
    const {openAI, validateMessageBeforeSending} = aiAssistant;
    const config = openAI?.chat as OpenAI['chat'];
    if (config && typeof config !== 'boolean') {
      this._total_messages_max_char_length = config.total_messages_max_char_length;
      this._max_messages = config.max_messages;
      if (config.systemPrompt) this._systemMessage = OpenAIChatIO.generateSystemMessage(config.systemPrompt);
      if (config.requestInterceptor) this.requestInterceptor = config.requestInterceptor;
      if (config.responseInterceptor) this.resposeInterceptor = config.responseInterceptor;
    }
    const requestSettings = typeof config === 'object' ? config.request : undefined;
    if (key) this.requestSettings = key ? OpenAIUtils.buildRequestSettings(key, requestSettings) : requestSettings;
    if (typeof config === 'object') this.cleanConfig(config);
    this._raw_body = OpenAIConverseBaseBody.build(OpenAIConverseBaseBody.GPT_CHAT_TURBO_MODEL, config);
    if (validateMessageBeforeSending) this.canSendMessage = validateMessageBeforeSending;
  }

  public static generateSystemMessage(systemPrompt: string): SystemMessageInternal {
    return {role: 'system', content: systemPrompt};
  }

  private cleanConfig(config: OpenAICustomChatConfig & ServiceCallConfig) {
    delete config.total_messages_max_char_length;
    delete config.max_messages;
    delete config.request;
    delete config.systemPrompt;
    delete config.requestInterceptor;
    delete config.responseInterceptor;
  }

  private static canSendMessage(text: string) {
    return text.trim() !== '';
  }

  private addKey(onSuccess: (key: string) => void, key: string) {
    this.requestSettings = OpenAIUtils.buildRequestSettings(key, this.requestSettings);
    onSuccess(key);
  }

  // prettier-ignore
  verifyKey(inputElement: HTMLInputElement, keyVerificationHandlers: KeyVerificationHandlers) {
    OpenAIUtils.verifyKey(inputElement, this.addKey.bind(this, keyVerificationHandlers.onSuccess),
      keyVerificationHandlers.onFail, keyVerificationHandlers.onLoad);
  }

  // prettier-ignore
  private preprocessBody(body: OpenAIConverseBodyInternal, messages: MessageContent[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body));
    const totalMessagesMaxCharLength = this._total_messages_max_char_length || OpenAIUtils.CONVERSE_MAX_CHAR_LENGTH;
    const processedMessages = MessageLimitUtils.processMessages(messages, this._systemMessage.content.length,
      this._max_messages, totalMessagesMaxCharLength).map((message) => ({content: message.text, role: message.role}));
    bodyCopy.messages = [this._systemMessage, ...processedMessages];
    return bodyCopy;
  }

  // prettier-ignore
  callApi(messages: Messages, completionsHandlers: CompletionsHandlers, streamHandlers: StreamHandlers) {
    if (!this.requestSettings) throw new Error('Request settings have not been set up');
    const body = this.preprocessBody(this._raw_body, messages.messages);
    if (body.stream) {
      HTTPRequest.requestStream(this, body, messages,
        streamHandlers.onOpen, streamHandlers.onClose, streamHandlers.abortStream);
    } else {
      HTTPRequest.request(this, body, messages, completionsHandlers.onFinish);
    }
  }

  async extractResultData(result: OpenAIConverseResult): Promise<Result> {
    if (result.error) throw result.error.message;
    if (result.choices[0].delta) {
      return {text: result.choices[0].delta.content || ''};
    }
    if (result.choices[0].message) {
      return {text: result.choices[0].message.content};
    }
    return {text: ''};
  }
}
