import {AUDIO, DEEP_COPY, ERROR, FILES, IMAGES, ROLE, SRC, TEXT, TYPE} from '../../utils/consts/messageConstants';
import {REQUESTY_BUILD_HEADERS, REQUESTY_BUILD_KEY_VERIFICATION_DETAILS} from './utils/requestyUtils';
import {RequestyAPIResult, RequestyStreamEvent} from '../../types/requestyResult';
import {Requesty, RequestyChat} from '../../types/requesty';
import {DirectConnection} from '../../types/directConnection';
import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {Response as ResponseI} from '../../types/response';
import {DirectServiceIO} from '../utils/directServiceIO';
import {MessageFile} from '../../types/messageFile';
import {APIKey} from '../../types/APIKey';
import {DeepChat} from '../../deepChat';
import {
  RequestyRequestBody,
  RequestyToolCall,
  RequestyMessage,
  RequestyContent,
} from '../../types/requestyInternal';
import {
  INVALID_REQUEST_ERROR_PREFIX,
  AUTHENTICATION_ERROR_PREFIX,
  INPUT_AUDIO,
  IMAGE_URL,
  OBJECT,
  SYSTEM,
} from '../utils/serviceConstants';

// https://docs.requesty.ai/
export class RequestyIO extends DirectServiceIO {
  override insertKeyPlaceholderText = this.genereteAPIKeyName('Requesty');
  override keyHelpUrl = 'https://app.requesty.ai/api-keys';
  url = 'https://router.requesty.ai/v1/chat/completions';
  permittedErrorPrefixes = [INVALID_REQUEST_ERROR_PREFIX, AUTHENTICATION_ERROR_PREFIX];
  readonly _streamToolCalls?: RequestyToolCall[];

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = DEEP_COPY(deepChat.directConnection) as DirectConnection;
    const config = directConnectionCopy.requesty as Requesty & APIKey;
    super(deepChat, REQUESTY_BUILD_KEY_VERIFICATION_DETAILS(), REQUESTY_BUILD_HEADERS, config);
    if (typeof config === OBJECT) {
      this.completeConfig(config, (deepChat.directConnection?.requesty as RequestyChat)?.function_handler);
    }
    this.maxMessages ??= -1;
    this.rawBody.model ??= 'openai/gpt-4o';
    this.rawBody.max_tokens ??= 1000;
  }

  private static getAudioContent(files: MessageFile[]): RequestyContent[] {
    return files
      .filter((file) => file[TYPE] === AUDIO)
      .map((file) => {
        const base64Data = file[SRC]?.split(',')[1];
        const format = file[SRC]?.match(/data:audio\/([^;]+)/)?.[1] as 'wav' | 'mp3';
        return {
          [TYPE]: INPUT_AUDIO as 'input_audio',
          [INPUT_AUDIO]: {
            data: base64Data || '',
            format: format === 'wav' || format === 'mp3' ? format : 'mp3',
          },
        };
      })
      .filter((content) => content[INPUT_AUDIO].data.length > 0);
  }

  private static getContent(message: MessageContentI): string | RequestyContent[] {
    if (message[FILES] && message[FILES].length > 0) {
      const content: RequestyContent[] = [
        ...RequestyIO.getImageContent(message[FILES]),
        ...RequestyIO.getAudioContent(message[FILES]),
      ];
      if (message[TEXT] && message[TEXT].trim().length > 0) {
        content.unshift({[TYPE]: TEXT, [TEXT]: message[TEXT]});
      }
      return content.length > 0 ? content : message[TEXT] || '';
    }
    return message[TEXT] || '';
  }

  private preprocessBody(body: RequestyRequestBody, pMessages: MessageContentI[]) {
    const bodyCopy = DEEP_COPY(body) as RequestyRequestBody;
    const processedMessages = this.processMessages(pMessages).map((message) => {
      return {
        content: RequestyIO.getContent(message),
        [ROLE]: DirectServiceIO.getRoleViaUser(message[ROLE]),
      } as RequestyMessage;
    });

    const messages: RequestyMessage[] = [];
    if (this.systemMessage) messages.push({[ROLE]: SYSTEM, content: this.systemMessage});
    messages.push(...processedMessages);

    bodyCopy.messages = messages;
    return bodyCopy;
  }

  override async callServiceAPI(messages: Messages, pMessages: MessageContentI[]) {
    this.messages ??= messages;
    this.callDirectServiceServiceAPI(messages, pMessages, this.preprocessBody.bind(this), {});
  }

  override async extractResultData(result: RequestyAPIResult, prevBody?: Requesty): Promise<ResponseI> {
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
          [SRC]: image[IMAGE_URL].url,
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
          return this.handleToolsGeneric(
            {tool_calls: choice.message.tool_calls},
            this.functionHandler,
            this.messages,
            prevBody
          );
        }

        const files =
          choice.message[IMAGES]?.map((image) => ({
            [SRC]: image[IMAGE_URL].url,
          })) || [];

        return {
          [TEXT]: choice.message.content || '',
          files,
        };
      }
    }

    return {[TEXT]: ''};
  }

  private async extractStreamResult(choice: RequestyStreamEvent['choices'][0], prevBody?: Requesty) {
    const {delta} = choice;
    // Handle streaming response with images
    if (delta?.[IMAGES]) {
      const files = delta[IMAGES].map((image) => ({
        [SRC]: image[IMAGE_URL].url,
      }));

      return {
        [TEXT]: delta.content || '',
        [FILES]: files,
      };
    }
    return this.extractStreamResultWToolsGeneric(this, choice, this.functionHandler, prevBody);
  }
}
