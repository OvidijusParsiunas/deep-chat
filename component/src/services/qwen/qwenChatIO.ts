import { MessageUtils } from '../../views/chat/messages/utils/messageUtils';
import { QwenRequestBody, QwenMessage } from '../../types/qwenInternal';
import { DirectConnection } from '../../types/directConnection';
import { MessageLimitUtils } from '../utils/messageLimitUtils';
import { MessageContentI } from '../../types/messagesInternal';
import { Messages } from '../../views/chat/messages/messages';
import { Response as ResponseI } from '../../types/response';
import { HTTPRequest } from '../../utils/HTTP/HTTPRequest';
import { DirectServiceIO } from '../utils/directServiceIO';
import { QwenResult } from '../../types/qwenResult';
import { Stream } from '../../utils/HTTP/stream';
import { QwenUtils } from './utils/qwenUtils';
import { APIKey } from '../../types/APIKey';
import { DeepChat } from '../../deepChat';
import { Qwen } from '../../types/qwen';

// https://www.alibabacloud.com/help/en/model-studio/use-qwen-by-calling-api
export class QwenChatIO extends DirectServiceIO {
  override insertKeyPlaceholderText = 'Qwen API Key';
  override keyHelpUrl = 'https://www.alibabacloud.com/help/en/model-studio/get-api-key';
  url = 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions';
  permittedErrorPrefixes = ['No static', 'The model', 'Incorrect'];
  private readonly _systemMessage: string = 'You are a helpful assistant.';

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = JSON.parse(JSON.stringify(deepChat.directConnection)) as DirectConnection;
    const apiKey = directConnectionCopy.qwen;
    super(deepChat, QwenUtils.buildKeyVerificationDetails(), QwenUtils.buildHeaders, apiKey);
    const config = directConnectionCopy.qwen;
    if (typeof config === 'object') {
      if (config.system_prompt) this._systemMessage = config.system_prompt;
      this.cleanConfig(config);
      Object.assign(this.rawBody, config);
    }
    this.maxMessages ??= -1;
    this.rawBody.model ??= 'qwen-plus';
  }

  private cleanConfig(config: Qwen & APIKey) {
    delete config.system_prompt;
    delete config.key;
  }

  private preprocessBody(body: QwenRequestBody, pMessages: MessageContentI[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body)) as QwenRequestBody;
    const processedMessages = MessageLimitUtils.getCharacterLimitMessages(
      pMessages,
      this.totalMessagesMaxCharLength ? this.totalMessagesMaxCharLength - this._systemMessage.length : -1
    ).map((message) => {
      return {
        content: message.text || '',
        role: message.role === MessageUtils.USER_ROLE ? 'user' : 'assistant',
      } as QwenMessage;
    });

    bodyCopy.messages = [{ role: 'system', content: this._systemMessage }, ...processedMessages];
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

  override async extractResultData(result: QwenResult): Promise<ResponseI> {
    if (result.error) throw result.error.message;

    if (result.choices && result.choices.length > 0) {
      const choice = result.choices[0];

      // Handle streaming response
      if (choice.delta && choice.delta.content) {
        return { text: choice.delta.content };
      }

      // Handle non-streaming response
      if (choice.message && choice.message.content) {
        return { text: choice.message.content };
      }
    }

    return { text: '' };
  }
}
