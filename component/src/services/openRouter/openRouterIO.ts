import {OpenRouterAPIResult, OpenRouterStreamEvent} from '../../types/openRouterResult';
import {MessageUtils} from '../../views/chat/messages/utils/messageUtils';
import {ErrorMessages} from '../../utils/errorMessages/errorMessages';
import {DirectConnection} from '../../types/directConnection';
import {MessageLimitUtils} from '../utils/messageLimitUtils';
import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {Response as ResponseI} from '../../types/response';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {DirectServiceIO} from '../utils/directServiceIO';
import {OpenRouterUtils} from './utils/openRouterUtils';
import {ChatFunctionHandler} from '../../types/openAI';
import {MessageFile} from '../../types/messageFile';
import {OpenRouter} from '../../types/openRouter';
import {Stream} from '../../utils/HTTP/stream';
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
  override insertKeyPlaceholderText = 'OpenRouter API Key';
  override keyHelpUrl = 'https://openrouter.ai/keys';
  url = 'https://openrouter.ai/api/v1/chat/completions';
  permittedErrorPrefixes = ['invalid_request_error', 'authentication_error'];
  _functionHandler?: ChatFunctionHandler;
  private _streamToolCalls?: OpenRouterToolCall[];
  private readonly _systemMessage: string = 'You are a helpful assistant.';
  private _messages?: Messages;

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = JSON.parse(JSON.stringify(deepChat.directConnection)) as DirectConnection;
    const config = directConnectionCopy.openRouter;
    super(deepChat, OpenRouterUtils.buildKeyVerificationDetails(), OpenRouterUtils.buildHeaders, config);
    if (typeof config === 'object') {
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

  private static getImageContent(files: MessageFile[]): OpenRouterContent[] {
    return files
      .filter((file) => file.type === 'image')
      .map((file) => ({
        type: 'image_url' as const,
        image_url: {
          url: file.src || '',
        },
      }))
      .filter((content) => content.image_url.url.length > 0);
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
        content.unshift({type: 'text', text: message.text});
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
    if (!this.connectSettings) throw new Error('Request settings have not been set up');
    this._messages ??= messages;
    const body = this.preprocessBody(this.rawBody, pMessages);
    const stream = this.stream;
    if ((stream && (typeof stream !== 'object' || !stream.simulation)) || body.stream) {
      body.stream = true;
      Stream.request(this, body, messages);
    } else {
      HTTPRequest.request(this, body, messages);
    }
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
          text: result.message.content || '',
          files,
        };
      }

      return {text: ''};
    }

    // Handle non-streaming response
    if (result.object === 'chat.completion') {
      const choice = result.choices?.[0];
      if (choice?.message) {
        if (choice.message.tool_calls) {
          return this.handleTools({tool_calls: choice.message.tool_calls}, prevBody);
        }

        const files =
          choice.message.images?.map((image) => ({
            src: image.image_url.url,
          })) || [];

        return {
          text: choice.message.content || '',
          files,
        };
      }
    }

    return {text: ''};
  }

  private async extractStreamResult(choice: OpenRouterStreamEvent['choices'][0], prevBody?: OpenRouter) {
    const {delta, finish_reason} = choice;
    // Handle streaming response with images
    if (delta?.images) {
      const files = delta.images.map((image) => ({
        src: image.image_url.url,
      }));

      return {
        text: delta.content || '',
        files,
      };
    }
    if (finish_reason === 'tool_calls') {
      const tools = {tool_calls: this._streamToolCalls};
      this._streamToolCalls = undefined;
      return this.handleTools(tools, prevBody);
    } else if (delta?.tool_calls) {
      if (!this._streamToolCalls) {
        this._streamToolCalls = delta.tool_calls;
      } else {
        delta.tool_calls.forEach((tool, index) => {
          if (this._streamToolCalls) this._streamToolCalls[index].function.arguments += tool.function.arguments;
        });
      }
    }
    return {text: delta?.content || ''};
  }

  // https://openrouter.ai/docs/features/tool-calling
  private async handleTools(tools: {tool_calls?: OpenRouterToolCall[]}, prevBody?: OpenRouter): Promise<ResponseI> {
    if (!tools.tool_calls || !prevBody || !this._functionHandler) {
      throw Error(ErrorMessages.DEFINE_FUNCTION_HANDLER);
    }
    const bodyCp = JSON.parse(JSON.stringify(prevBody));
    const functions = tools.tool_calls.map((call) => {
      return {name: call.function.name, arguments: call.function.arguments};
    });
    const {responses, processedResponse} = await this.callToolFunction(this._functionHandler, functions);
    if (processedResponse) return processedResponse;

    bodyCp.messages.push({tool_calls: tools.tool_calls, role: 'assistant', content: null});
    if (!responses.find(({response}) => typeof response !== 'string') && functions.length === responses.length) {
      responses.forEach((resp, index) => {
        const toolCall = tools.tool_calls?.[index];
        bodyCp?.messages.push({
          role: 'tool',
          tool_call_id: toolCall?.id,
          name: toolCall?.function.name,
          content: resp.response,
        });
      });

      return this.makeAnotherRequest(bodyCp, this._messages);
    }
    throw Error('Function tool response must be an array or contain a text property');
  }
}
