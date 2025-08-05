import {ClaudeContent, ClaudeMessage, ClaudeRequestBody} from '../../types/claudeInternal';
import {MessageUtils} from '../../views/chat/messages/utils/messageUtils';
import {DirectConnection} from '../../types/directConnection';
import {MessageLimitUtils} from '../utils/messageLimitUtils';
import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {Response as ResponseI} from '../../types/response';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {DirectServiceIO} from '../utils/directServiceIO';
import {ClaudeResult} from '../../types/claudeResult';
import {MessageFile} from '../../types/messageFile';
import {ClaudeUtils} from './utils/claudeUtils';
import {Stream} from '../../utils/HTTP/stream';
import {Claude} from '../../types/claude';
import {APIKey} from '../../types/APIKey';
import {DeepChat} from '../../deepChat';

// https://docs.anthropic.com/en/api/messages
export class ClaudeIO extends DirectServiceIO {
  override insertKeyPlaceholderText = 'Claude API Key';
  override keyHelpUrl = 'https://console.anthropic.com/settings/keys';
  url = 'https://api.anthropic.com/v1/messages';
  permittedErrorPrefixes = ['authentication_error', 'invalid_request_error'];
  private readonly _systemMessage: string = 'You are a helpful assistant.';

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = JSON.parse(JSON.stringify(deepChat.directConnection)) as DirectConnection;
    const apiKey = directConnectionCopy.claude;
    super(deepChat, ClaudeUtils.buildKeyVerificationDetails(), ClaudeUtils.buildHeaders, apiKey);
    const config = directConnectionCopy.claude;
    if (typeof config === 'object') {
      if (config.system_prompt) this._systemMessage = config.system_prompt;
      this.cleanConfig(config);
      Object.assign(this.rawBody, config);
    }
    this.maxMessages ??= -1;
    this.rawBody.model ??= 'claude-3-5-sonnet-20241022';
    this.rawBody.max_tokens ??= 4096;
  }

  private cleanConfig(config: Claude & APIKey) {
    delete config.system_prompt;
    delete config.key;
  }

  private static getFileContent(files: MessageFile[]): ClaudeContent[] {
    return files.map((file) => {
      if (file.type === 'image') {
        const base64Data = file.src?.split(',')[1];
        const mediaType = file.src?.match(/data:([^;]+)/)?.[1] || 'image/jpeg';
        return {type: 'image', source: {type: 'base64', media_type: mediaType, data: base64Data || ''}};
      }
      return {type: 'text', text: `[Unsupported file type: ${file.type}]`};
    });
  }

  private static getContent(message: MessageContentI): string | ClaudeContent[] {
    if (message.files && message.files.length > 0) {
      const content: ClaudeContent[] = ClaudeIO.getFileContent(message.files);
      if (message.text && message.text.trim().length > 0) {
        content.unshift({type: 'text', text: message.text});
      }
      return content;
    }
    return message.text || '';
  }

  private preprocessBody(body: ClaudeRequestBody, pMessages: MessageContentI[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body)) as ClaudeRequestBody;
    const processedMessages = MessageLimitUtils.getCharacterLimitMessages(
      pMessages,
      this.totalMessagesMaxCharLength ? this.totalMessagesMaxCharLength - this._systemMessage.length : -1
    ).map((message) => {
      return {
        content: ClaudeIO.getContent(message),
        role: message.role === MessageUtils.USER_ROLE ? 'user' : 'assistant',
      } as ClaudeMessage;
    });

    bodyCopy.messages = processedMessages;
    if (this._systemMessage) {
      bodyCopy.system = this._systemMessage;
    }
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

  override async extractResultData(result: ClaudeResult): Promise<ResponseI> {
    if (result.error) throw result.error.message;

    // Handle streaming events
    if (result.type === 'content_block_delta') {
      if (result.delta && result.delta.type === 'text_delta') {
        return {text: result.delta.text || ''};
      }
    }

    // Handle non-streaming response (final response)
    if (result.content && result.content.length > 0) {
      const textContent = result.content.find((item: {type: string; text: string}) => item.type === 'text');
      if (textContent) {
        return {text: textContent.text};
      }
    }

    // Return empty for other event types (message_start, content_block_start, etc.)
    return {text: ''};
  }
}
