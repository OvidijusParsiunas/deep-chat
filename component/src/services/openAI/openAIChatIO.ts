import {CompletionsHandlers, KeyVerificationHandlers, ServiceIO, StreamHandlers} from '../serviceIO';
import {OpenAIConverseBodyInternal, SystemMessageInternal} from '../../types/openAIInternal';
import {ValidateMessageBeforeSending} from '../../types/validateMessageBeforeSending';
import {OpenAIConverseBaseBody} from './utils/openAIConverseBaseBody';
import {OpenAI, OpenAICustomChatConfig} from '../../types/openAI';
import {RequestInterceptor} from '../../types/requestInterceptor';
import {OpenAIConverseResult} from '../../types/openAIResult';
import {BASE_64_PREFIX} from '../../utils/element/imageUtils';
import {RequestSettings} from '../../types/requestSettings';
import {Messages} from '../../views/chat/messages/messages';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {MessageContent} from '../../types/messages';
import {OpenAIUtils} from './utils/openAIUtils';
import {AiAssistant} from '../../aiAssistant';

// chat is a form of completions
export class OpenAIChatIO implements ServiceIO {
  url = 'https://api.openai.com/v1/chat/completions';
  requestSettings?: RequestSettings;
  requestInterceptor: RequestInterceptor;
  canSendMessage: ValidateMessageBeforeSending = OpenAIChatIO.canSendMessage;
  private readonly _raw_body: OpenAIConverseBodyInternal;
  private readonly _systemMessage: SystemMessageInternal =
    OpenAIChatIO.generateSystemMessage('You are a helpful assistant.');
  private readonly _total_messages_max_char_length?: number;
  private readonly _max_messages?: number;

  constructor(aiAssistant: AiAssistant, key?: string) {
    const {openAI, requestInterceptor, validateMessageBeforeSending} = aiAssistant;
    const config = openAI?.chat as OpenAI['chat'];
    if (config && typeof config !== 'boolean') {
      this._total_messages_max_char_length = config.total_messages_max_char_length;
      this._max_messages = config.max_messages;
      if (config.systemPrompt) this._systemMessage = OpenAIChatIO.generateSystemMessage(config.systemPrompt);
    }
    const requestSettings = typeof config === 'object' ? config.request : undefined;
    if (key) this.requestSettings = key ? OpenAIUtils.buildRequestSettings(key, requestSettings) : requestSettings;
    this.requestInterceptor = requestInterceptor || ((details) => details);
    if (typeof config === 'object') this.cleanConfig(config);
    this._raw_body = OpenAIConverseBaseBody.build(OpenAIConverseBaseBody.GPT_CHAT_TURBO_MODEL, config);
    if (validateMessageBeforeSending) this.canSendMessage = validateMessageBeforeSending;
  }

  public static generateSystemMessage(systemPrompt: string): SystemMessageInternal {
    return {role: 'system', content: systemPrompt};
  }

  private cleanConfig(config: OpenAICustomChatConfig & {request?: RequestSettings}) {
    delete config.total_messages_max_char_length;
    delete config.max_messages;
    delete config.request;
    delete config.systemPrompt;
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
  private processMessages(messages: MessageContent[], systemMessageLength: number, totalMessagesMaxCharLength: number,
      maxMessages?: number) {
    let totalCharacters = 0;
    if (maxMessages !== undefined && maxMessages > 0) {
      messages = messages.splice(Math.max(messages.length - maxMessages, 0));
    }
    // Not removing the first message in order to retain the initial 'system' message
    const limit = totalMessagesMaxCharLength - systemMessageLength;
    let i = messages.length - 1;
    for (i; i >= 0; i -= 1) {
      totalCharacters += messages[i].content.length;
      if (totalCharacters > limit) {
        messages[i].content = messages[i].content.substring(0, messages[i].content.length - (totalCharacters - limit));
        break;
      }
    }
    return messages.slice(Math.max(i, 0));
  }

  // prettier-ignore
  private preprocessBody(body: OpenAIConverseBodyInternal, messages: MessageContent[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body));
    const filteredMessages = (messages.filter((message) => {
      return !message.content.startsWith(BASE_64_PREFIX) && !message.content.startsWith('http');
    }));
    const totalMessagesMaxCharLength = this._total_messages_max_char_length || OpenAIUtils.CONVERSE_MAX_CHAR_LENGTH;
    const processedMessages = this.processMessages(filteredMessages, this._systemMessage.content.length,
      totalMessagesMaxCharLength, this._max_messages);
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

  extractResultData(result: OpenAIConverseResult): string {
    if (result.error) throw result.error.message;
    if (result.choices[0].delta) {
      return result.choices[0].delta.content || '';
    }
    if (result.choices[0].message) {
      return result.choices[0].message.content;
    }
    return '';
  }
}
