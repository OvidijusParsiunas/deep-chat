import {AUTHENTICATION_ERROR_PREFIX, INVALID_REQUEST_ERROR_PREFIX, OBJECT} from '../utils/serviceConstants';
import {OpenRouterAPIResult, OpenRouterStreamEvent} from '../../types/openRouterResult';
import {MessageUtils} from '../../views/chat/messages/utils/messageUtils';
import {DirectConnection} from '../../types/directConnection';
import {MessageLimitUtils} from '../utils/messageLimitUtils';
import {MessageContentI} from '../../types/messagesInternal';
import {TEXT_KEY} from '../../utils/consts/messageConstants';
import {Messages} from '../../views/chat/messages/messages';
import {Response as ResponseI} from '../../types/response';
import {DirectServiceIO} from '../utils/directServiceIO';
import {OpenRouterUtils} from './utils/openRouterUtils';
import {ChatFunctionHandler} from '../../types/openAI';
import {MessageFile} from '../../types/messageFile';
import {OpenRouter} from '../../types/openRouter';
import {APIKey} from '../../types/APIKey';
import {DeepChat} from '../../deepChat';
import {
  OpenRouterRequestBody,
  OpenRouterToolCall,
  OpenRouterMessage,
  OpenRouterContent,
} from '../../types/openRouterInternal';

// https://openrouter.ai/docs/api-reference/overview
// WORK - add a panel stating that you can upload images and ask the model to generate
// images (gemini-2.5-flash-image-preview)
export class OpenRouterIO extends DirectServiceIO {
  override insertKeyPlaceholderText = this.genereteAPIKeyName('OpenRouter');
  override keyHelpUrl = 'https://openrouter.ai/keys';
  url = 'https://openrouter.ai/api/v1/chat/completions';
  permittedErrorPrefixes = [INVALID_REQUEST_ERROR_PREFIX, AUTHENTICATION_ERROR_PREFIX];
  _functionHandler?: ChatFunctionHandler;
  readonly _streamToolCalls?: OpenRouterToolCall[];
  private readonly _systemMessage: string = '';
  private _messages?: Messages;

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = JSON.parse(JSON.stringify(deepChat.directConnection)) as DirectConnection;
    const config = directConnectionCopy.openRouter as OpenRouter & APIKey;
    super(deepChat, OpenRouterUtils.buildKeyVerificationDetails(), OpenRouterUtils.buildHeaders, config);
    if (typeof config === OBJECT) {
      if (config.system_prompt) this._systemMessage = config.system_prompt;
      const function_handler = (deepChat.directConnection?.openRouter as OpenRouter)?.function_handler;
      if (function_handler) this._functionHandler = function_handler;
      this.cleanConfig(config);
      Object.assign(this.rawBody, config);
    }
    this.maxMessages ??= -1;
    this.rawBody.model ??= 'openai/gpt-4o';
    this.rawBody.max_tokens ??= 1000;
  }

  private cleanConfig(config: OpenRouter & APIKey) {
    delete config.system_prompt;
    delete config.function_handler;
    delete config.key;
  }

  private static getAudioContent(files: MessageFile[]): OpenRouterContent[] {
    return files
      .filter((file) => file.type === 'audio')
      .map((file) => {
        const base64Data = file.src?.split(',')[1];
        const format = file.src?.match(/data:audio\/([^;]+)/)?.[1] as 'wav' | 'mp3';

        return {
          type: 'input_audio' as const,
          input_audio: {
            data: base64Data || '',
            format: format === 'wav' || format === 'mp3' ? format : 'mp3',
          },
        };
      })
      .filter((content) => content.input_audio.data.length > 0);
  }

  private static getContent(message: MessageContentI): string | OpenRouterContent[] {
    if (message.files && message.files.length > 0) {
      const content: OpenRouterContent[] = [
        ...OpenRouterIO.getImageContent(message.files),
        ...OpenRouterIO.getAudioContent(message.files),
      ];
      if (message.text && message.text.trim().length > 0) {
        content.unshift({type: 'text', [TEXT_KEY]: message.text});
      }
      return content.length > 0 ? content : message.text || '';
    }
    return message.text || '';
  }

  private preprocessBody(body: OpenRouterRequestBody, pMessages: MessageContentI[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body)) as OpenRouterRequestBody;
    const processedMessages = MessageLimitUtils.getCharacterLimitMessages(
      pMessages,
      this.totalMessagesMaxCharLength ? this.totalMessagesMaxCharLength - this._systemMessage.length : -1
    ).map((message) => {
      return {
        content: OpenRouterIO.getContent(message),
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
    this._messages ??= messages;
    this.callDirectServiceServiceAPI(messages, pMessages, this.preprocessBody, {});
  }

  override async extractResultData(result: OpenRouterAPIResult, prevBody?: OpenRouter): Promise<ResponseI> {
    if (result.error) throw result.error.message;

    // Handle streaming events
    if (result.object === 'chat.completion.chunk') {
      const choice = result.choices?.[0];
      if (choice?.delta) {
        return this.extractStreamResult(choice, prevBody);
      }

      // Handle streaming response with images
      if (result.message?.images) {
        const files = result.message.images.map((image) => ({
          src: image.image_url.url,
        }));

        return {
          [TEXT_KEY]: result.message.content || '',
          files,
        };
      }

      return {[TEXT_KEY]: ''};
    }

    // Handle non-streaming response
    if (result.object === 'chat.completion') {
      const choice = result.choices?.[0];
      if (choice?.message) {
        if (choice.message.tool_calls) {
          // https://openrouter.ai/docs/features/tool-calling
          return this.handleToolsGeneric(
            {tool_calls: choice.message.tool_calls},
            this._functionHandler,
            this._messages,
            prevBody
          );
        }

        const files =
          choice.message.images?.map((image) => ({
            src: image.image_url.url,
          })) || [];

        return {
          [TEXT_KEY]: choice.message.content || '',
          files,
        };
      }
    }

    return {[TEXT_KEY]: ''};
  }

  private async extractStreamResult(choice: OpenRouterStreamEvent['choices'][0], prevBody?: OpenRouter) {
    const {delta} = choice;
    // Handle streaming response with images
    if (delta?.images) {
      const files = delta.images.map((image) => ({
        src: image.image_url.url,
      }));

      return {
        [TEXT_KEY]: delta.content || '',
        files,
      };
    }
    return this.extractStreamResultWToolsGeneric(this, choice, this._functionHandler, this._messages, prevBody);
  }
}
