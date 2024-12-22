import {OpenAIConverseBodyInternal, SystemMessageInternal} from '../../types/openAIInternal';
import {MessageUtils} from '../../views/chat/messages/utils/messageUtils';
import {DirectConnection} from '../../types/directConnection';
import {MessageLimitUtils} from '../utils/messageLimitUtils';
import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {DirectServiceIO} from '../utils/directServiceIO';
import {GeminiUtils} from './utils/geminiUtils';
import {Stream} from '../../utils/HTTP/stream';
import {OpenAIChat} from '../../types/openAI';
import {DeepChat} from '../../deepChat';

type ImageContent = {type: string; image_url?: {url?: string}; text?: string}[];

// template
export class GeminiIO extends DirectServiceIO {
  override insertKeyPlaceholderText = 'OpenAI API Key';
  override keyHelpUrl = 'https://platform.openai.com/account/api-keys';
  url = 'https://api.openai.com/v1/chat/completions';
  permittedErrorPrefixes = ['Incorrect'];
  asyncCallInProgress = false; // used when streaming tools
  private readonly _systemMessage: SystemMessageInternal = GeminiIO.generateSystemMessage('You are a helpful assistant.');

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = JSON.parse(JSON.stringify(deepChat.directConnection)) as DirectConnection;
    const apiKey = directConnectionCopy.openAI;
    super(deepChat, GeminiUtils.buildKeyVerificationDetails(), GeminiUtils.buildHeaders, apiKey);
    const config = directConnectionCopy.openAI?.chat; // can be undefined as this is the default service
    if (typeof config === 'object') {
      if (config.system_prompt) this._systemMessage = GeminiIO.generateSystemMessage(config.system_prompt);
      this.cleanConfig(config);
      Object.assign(this.rawBody, config);
    }
    this.maxMessages ??= -1;
    this.rawBody.model ??= 'gpt-4o';
  }

  private static generateSystemMessage(system_prompt: string): SystemMessageInternal {
    return {role: 'system', content: system_prompt};
  }

  private cleanConfig(config: OpenAIChat) {
    delete config.system_prompt;
    delete config.function_handler;
  }

  private static getContent(message: MessageContentI) {
    if (message.files && message.files.length > 0) {
      const content: ImageContent = message.files.map((file) => {
        return {type: 'image_url', image_url: {url: file.src}};
      });
      if (message.text && message.text.trim().length > 0) content.unshift({type: 'text', text: message.text});
      return content;
    }
    return message.text;
  }

  // prettier-ignore
  private preprocessBody(body: OpenAIConverseBodyInternal, pMessages: MessageContentI[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body));
    const processedMessages = MessageLimitUtils.getCharacterLimitMessages(pMessages,
        this.totalMessagesMaxCharLength ? this.totalMessagesMaxCharLength - this._systemMessage.content.length : -1)
      .map((message) => {
        return {content: GeminiIO.getContent(message),
          role: message.role === MessageUtils.USER_ROLE ? 'user' : 'assistant'};});
    if (pMessages.find((message) => message.files && message.files.length > 0)) {
      bodyCopy.max_tokens ??= 300; // otherwise AI does not return full responses - remove when this behaviour changes
    }
    bodyCopy.messages = [this._systemMessage, ...processedMessages];
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
}
