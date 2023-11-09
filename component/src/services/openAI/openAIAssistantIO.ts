import {OpenAIConverseBodyInternal} from '../../types/openAIInternal';
import {OpenAIConverseBaseBody} from './utils/openAIConverseBaseBody';
import {MessageUtils} from '../../views/chat/messages/messageUtils';
import {OpenAIConverseResult} from '../../types/openAIResult';
import {DirectConnection} from '../../types/directConnection';
import {MessageLimitUtils} from '../utils/messageLimitUtils';
import {Messages} from '../../views/chat/messages/messages';
import {Response as ResponseT} from '../../types/response';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {DirectServiceIO} from '../utils/directServiceIO';
import {MessageContent} from '../../types/messages';
import {OpenAIUtils} from './utils/openAIUtils';
import {DeepChat} from '../../deepChat';

type ImageContent = {type: string; image_url?: {url?: string}; text?: string}[];

// clear messages should delete a thread

// chat is a form of completions
export class OpenAIAssistantIO extends DirectServiceIO {
  override insertKeyPlaceholderText = 'OpenAI API Key';
  override getKeyLink = 'https://platform.openai.com/account/api-keys';
  url = 'https://api.openai.com/v1/chat/completions';
  permittedErrorPrefixes = ['Incorrect'];

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = JSON.parse(JSON.stringify(deepChat.directConnection)) as DirectConnection;
    const apiKey = directConnectionCopy.openAI;
    const imageFiles = deepChat.images ? {images: {files: {maxNumberOfFiles: 10}}} : {};
    super(deepChat, OpenAIUtils.buildKeyVerificationDetails(), OpenAIUtils.buildHeaders, apiKey, imageFiles);
    const config = directConnectionCopy.openAI?.chat; // can be undefined as this is the default service
    if (typeof config === 'object') {
      Object.assign(this.rawBody, config);
    }
    this.maxMessages ??= 1;
    this.rawBody.model ??= OpenAIConverseBaseBody.GPT_CHAT_TURBO_MODEL;
  }

  private static getContent(message: MessageContent) {
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
  private preprocessBody(body: OpenAIConverseBodyInternal, pMessages: MessageContent[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body));
    const totalMessagesMaxCharLength = this.totalMessagesMaxCharLength || OpenAIUtils.CONVERSE_MAX_CHAR_LENGTH;
    const processedMessages = MessageLimitUtils.getCharacterLimitMessages(pMessages, totalMessagesMaxCharLength)
      .map((message) => {
        return {content: OpenAIAssistantIO.getContent(message),
          role: message.role === MessageUtils.AI_ROLE ? 'assistant' : 'user'};});
    // if (pMessages.find((message) => message.files && message.files.length > 0)) {
    //   bodyCopy.max_tokens ??= 300; // AI otherwise does not return full responses - remove when this behaviour changes
    // }
    bodyCopy.messages = processedMessages;
    return bodyCopy;
  }

  override async callServiceAPI(messages: Messages, pMessages: MessageContent[]) {
    if (!this.requestSettings) throw new Error('Request settings have not been set up');
    this.requestSettings.headers ??= {};
    this.requestSettings.headers['OpenAI-Beta'] = 'assistants=v1';
    const body = this.preprocessBody(this.rawBody, pMessages);
    HTTPRequest.request(this, body, messages);
  }

  // prettier-ignore
  override async extractResultData(result: OpenAIConverseResult): Promise<ResponseT> {
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
