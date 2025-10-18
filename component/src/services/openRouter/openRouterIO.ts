import {OPEN_ROUTER_BUILD_HEADERS, OPEN_ROUTER_BUILD_KEY_VERIFICATION_DETAILS} from './utils/openRouterUtils';
import {AUTHENTICATION_ERROR_PREFIX, INVALID_REQUEST_ERROR_PREFIX, OBJECT} from '../utils/serviceConstants';
import {AUDIO, ERROR, FILES, IMAGES, SRC, TEXT, TYPE} from '../../utils/consts/messageConstants';
import {OpenRouterAPIResult, OpenRouterStreamEvent} from '../../types/openRouterResult';
import {DirectConnection} from '../../types/directConnection';
import {MessageLimitUtils} from '../utils/messageLimitUtils';
import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {Response as ResponseI} from '../../types/response';
import {DirectServiceIO} from '../utils/directServiceIO';
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
    super(deepChat, OPEN_ROUTER_BUILD_KEY_VERIFICATION_DETAILS(), OPEN_ROUTER_BUILD_HEADERS, config);
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
      .filter((file) => file.type === AUDIO)
      .map((file) => {
        const base64Data = file.src?.split(',')[1];
        const format = file.src?.match(/data:audio\/([^;]+)/)?.[1] as 'wav' | 'mp3';

        return {
          [TYPE]: 'input_audio' as const,
          input_audio: {
            data: base64Data || '',
            format: format === 'wav' || format === 'mp3' ? format : 'mp3',
          },
        };
      })
      .filter((content) => content.input_audio.data.length > 0);
  }

  private static getContent(message: MessageContentI): string | OpenRouterContent[] {
    if (message[FILES] && message[FILES].length > 0) {
      const content: OpenRouterContent[] = [
        ...OpenRouterIO.getImageContent(message[FILES]),
        ...OpenRouterIO.getAudioContent(message[FILES]),
      ];
      if (message[TEXT] && message[TEXT].trim().length > 0) {
        content.unshift({[TYPE]: TEXT, [TEXT]: message[TEXT]});
      }
      return content.length > 0 ? content : message[TEXT] || '';
    }
    return message[TEXT] || '';
  }

  private preprocessBody(body: OpenRouterRequestBody, pMessages: MessageContentI[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body)) as OpenRouterRequestBody;
    const processedMessages = MessageLimitUtils.getCharacterLimitMessages(
      pMessages,
      this.totalMessagesMaxCharLength ? this.totalMessagesMaxCharLength - this._systemMessage.length : -1
    ).map((message) => {
      return {
        content: OpenRouterIO.getContent(message),
        role: DirectServiceIO.getRoleViaUser(message.role),
      } as OpenRouterMessage;
    });

    const messages: OpenRouterMessage[] = [];
    if (this._systemMessage) messages.push({role: 'system', content: this._systemMessage});
    messages.push(...processedMessages);

    bodyCopy.messages = messages;
    return bodyCopy;
  }

  override async callServiceAPI(messages: Messages, pMessages: MessageContentI[]) {
    this._messages ??= messages;
    this.callDirectServiceServiceAPI(messages, pMessages, this.preprocessBody.bind(this), {});
  }

  override async extractResultData(result: OpenRouterAPIResult, prevBody?: OpenRouter): Promise<ResponseI> {
    if (result[ERROR]) throw result[ERROR].message;

    // Handle streaming events
    if (result.object === 'chat.completion.chunk') {
      const choice = result.choices?.[0];
      if (choice?.delta) {
        return this.extractStreamResult(choice, prevBody);
      }

      // Handle streaming response with images
      if (result.message?.[IMAGES]) {
        const files = result.message[IMAGES].map((image) => ({
          [SRC]: image.image_url.url,
        }));

        return {
          [TEXT]: result.message.content || '',
          [FILES]: files,
        };
      }

      return {[TEXT]: ''};
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
          choice.message[IMAGES]?.map((image) => ({
            [SRC]: image.image_url.url,
          })) || [];

        return {
          [TEXT]: choice.message.content || '',
          files,
        };
      }
    }

    return {[TEXT]: ''};
  }

  private async extractStreamResult(choice: OpenRouterStreamEvent['choices'][0], prevBody?: OpenRouter) {
    const {delta} = choice;
    // Handle streaming response with images
    if (delta?.[IMAGES]) {
      const files = delta[IMAGES].map((image) => ({
        [SRC]: image.image_url.url,
      }));

      return {
        [TEXT]: delta.content || '',
        [FILES]: files,
      };
    }
    return this.extractStreamResultWToolsGeneric(this, choice, this._functionHandler, this._messages, prevBody);
  }
}
