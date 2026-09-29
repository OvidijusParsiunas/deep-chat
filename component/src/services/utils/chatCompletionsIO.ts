import {ChatCompletionsAPIResult, ChatCompletionsStreamChoice} from '../../types/chatCompletionsResult';
import {AUDIO, DEEP_COPY, ERROR, FILES, IMAGES, ROLE, SRC, TEXT, TYPE} from '../../utils/consts/messageConstants';
import {KeyVerificationDetails} from '../../types/keyVerificationDetails';
import {ChatCompletionsChat} from '../../types/chatCompletions';
import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {Response as ResponseI} from '../../types/response';
import {INPUT_AUDIO, IMAGE_URL, OBJECT} from './serviceConstants';
import {ChatFunctionHandler} from '../../types/openAI';
import {BuildHeadersFunc} from '../../types/headers';
import {MessageFile} from '../../types/messageFile';
import {DirectServiceIO} from './directServiceIO';
import {APIKey} from '../../types/APIKey';
import {DeepChat} from '../../deepChat';
import {
  ChatCompletionsRequestBody,
  ChatCompletionsToolCall,
  ChatCompletionsMessage,
  ChatCompletionsContent,
} from '../../types/chatCompletionsInternal';

// Base for providers that expose an OpenAI-compatible Chat Completions API
// https://platform.openai.com/docs/api-reference/chat/create
export class ChatCompletionsIO extends DirectServiceIO {
  readonly _streamToolCalls?: ChatCompletionsToolCall[];

  // apiKey and config are separate as some providers nest the chat config (e.g. directConnection.groq.chat)
  // prettier-ignore
  constructor(deepChat: DeepChat, keyVerificationDetails: KeyVerificationDetails, buildHeadersFunc: BuildHeadersFunc,
      apiKey?: APIKey, config?: true | {system_prompt?: string}, functionHandler?: ChatFunctionHandler) {
    super(deepChat, keyVerificationDetails, buildHeadersFunc, apiKey);
    if (typeof config === OBJECT) this.completeConfig(config as {system_prompt?: string}, functionHandler);
    this.maxMessages ??= -1;
  }

  private static getAudioContent(files: MessageFile[]): ChatCompletionsContent[] {
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

  protected getRole(role: string): string {
    return DirectServiceIO.getRoleViaUser(role);
  }

  protected getContent(message: MessageContentI): string | ChatCompletionsContent[] {
    if (message[FILES] && message[FILES].length > 0) {
      const content: ChatCompletionsContent[] = [
        ...ChatCompletionsIO.getImageContent(message[FILES]),
        ...ChatCompletionsIO.getAudioContent(message[FILES]),
      ];
      if (message[TEXT] && message[TEXT].trim().length > 0) {
        content.unshift({[TYPE]: TEXT, [TEXT]: message[TEXT]});
      }
      return content.length > 0 ? content : message[TEXT] || '';
    }
    return message[TEXT] || '';
  }

  private preprocessBody(body: ChatCompletionsRequestBody, pMessages: MessageContentI[]) {
    const bodyCopy = DEEP_COPY(body) as ChatCompletionsRequestBody;
    const processedMessages = this.processMessages(pMessages).map((message) => {
      return {
        content: this.getContent(message),
        [ROLE]: this.getRole(message[ROLE]),
      } as ChatCompletionsMessage;
    });
    this.addSystemMessage(processedMessages);
    bodyCopy.messages = processedMessages;
    return bodyCopy;
  }

  override async callServiceAPI(messages: Messages, pMessages: MessageContentI[]) {
    this.messages ??= messages;
    this.callDirectServiceServiceAPI(messages, pMessages, this.preprocessBody.bind(this), {});
  }

  // override for providers that do not use the {error: {message}} shape
  protected throwIfError(result: ChatCompletionsAPIResult) {
    if (result[ERROR]) throw result[ERROR].message;
  }

  protected handleTools(tools: {tool_calls?: ChatCompletionsToolCall[]}, prevBody?: ChatCompletionsChat) {
    return this.handleToolsGeneric(tools, this.functionHandler, this.messages, prevBody);
  }

  private static getImageFiles(images: {[IMAGE_URL]: {url: string}}[]) {
    return images.map((image) => ({[SRC]: image[IMAGE_URL].url}));
  }

  override async extractResultData(result: ChatCompletionsAPIResult, prevBody?: ChatCompletionsChat): Promise<ResponseI> {
    this.throwIfError(result);
    const choice = result.choices?.[0];

    // Handle streaming response
    if (choice && 'delta' in choice && choice.delta) {
      return this.extractStreamResult(choice, prevBody);
    }

    // Handle non-streaming response
    if (choice && 'message' in choice && choice.message) {
      if (choice.message.tool_calls) {
        return this.handleTools({tool_calls: choice.message.tool_calls}, prevBody);
      }
      const response: ResponseI = {[TEXT]: choice.message.content || ''};
      if (choice.message[IMAGES]) response[FILES] = ChatCompletionsIO.getImageFiles(choice.message[IMAGES]);
      return response;
    }

    // Handle streaming response with images (OpenRouter)
    if ('message' in result && result.message?.[IMAGES]) {
      return {
        [TEXT]: result.message.content || '',
        [FILES]: ChatCompletionsIO.getImageFiles(result.message[IMAGES]),
      };
    }

    return {[TEXT]: ''};
  }

  private async extractStreamResult(choice: ChatCompletionsStreamChoice, prevBody?: ChatCompletionsChat) {
    const {delta} = choice;
    // Handle streaming response with images
    if (delta?.[IMAGES]) {
      return {
        [TEXT]: delta.content || '',
        [FILES]: ChatCompletionsIO.getImageFiles(delta[IMAGES]),
      };
    }
    return this.extractStreamResultWToolsGeneric(this, choice, this.functionHandler, prevBody);
  }
}
