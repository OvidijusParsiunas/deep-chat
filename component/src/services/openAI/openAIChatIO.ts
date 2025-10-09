import {OpenAIConverseResult, ResultChoice, ToolCalls} from '../../types/openAIResult';
import {KeyVerificationDetails} from '../../types/keyVerificationDetails';
import {MessageUtils} from '../../views/chat/messages/utils/messageUtils';
import {INCORRECT_ERROR_PREFIX, OBJECT} from '../utils/serviceConstants';
import {OpenAIConverseBodyInternal} from '../../types/openAIInternal';
import {ChatFunctionHandler, OpenAIChat} from '../../types/openAI';
import {DirectConnection} from '../../types/directConnection';
import {MessageLimitUtils} from '../utils/messageLimitUtils';
import {MessageContentI} from '../../types/messagesInternal';
import {TEXT_KEY} from '../../utils/consts/messageConstants';
import {Messages} from '../../views/chat/messages/messages';
import {Response as ResponseI} from '../../types/response';
import {DirectServiceIO} from '../utils/directServiceIO';
import {BuildHeadersFunc} from '../../types/headers';
import {MessageFile} from '../../types/messageFile';
import {OpenAIUtils} from './utils/openAIUtils';
import {APIKey} from '../../types/APIKey';
import {DeepChat} from '../../deepChat';

type FileContent = {
  type: string;
  image_url?: {url?: string};
  input_audio?: {data?: string; format: string};
  text?: string;
}[];

export class OpenAIChatIO extends DirectServiceIO {
  override insertKeyPlaceholderText = this.genereteAPIKeyName('OpenAI');
  override keyHelpUrl = 'https://platform.openai.com/account/api-keys';
  // https://platform.openai.com/docs/api-reference/chat/create
  url = 'https://api.openai.com/v1/chat/completions';
  permittedErrorPrefixes = [INCORRECT_ERROR_PREFIX, 'Invalid value'];
  _functionHandler?: ChatFunctionHandler;
  _streamToolCalls?: ToolCalls;
  private readonly _systemMessage: string = '';
  private _messages?: Messages;

  // https://platform.openai.com/docs/models/gpt-4o-audio-preview
  // prettier-ignore
  constructor(deepChat: DeepChat, keyVerificationDetailsArg?: KeyVerificationDetails,
      buildHeadersFuncArg?: BuildHeadersFunc, apiKeyArg?: APIKey, configArg?: true | OpenAIChat) {
    const directConnectionCopy = JSON.parse(JSON.stringify(deepChat.directConnection)) as DirectConnection;
    const keyVerificationDetails = keyVerificationDetailsArg || OpenAIUtils.buildKeyVerificationDetails();
    const buildHeadersFunc = buildHeadersFuncArg || OpenAIUtils.buildHeaders;
    const apiKey = apiKeyArg || directConnectionCopy.openAI;
    super(deepChat, keyVerificationDetails, buildHeadersFunc, apiKey);
    // can be undefined as this is the default service
    const config = (configArg || directConnectionCopy.openAI?.chat) as OpenAIChat;
    if (typeof config === OBJECT) {
      if (config.system_prompt) this._systemMessage = config.system_prompt;
      const function_handler = (deepChat.directConnection?.openAI?.chat as OpenAIChat)?.function_handler;
      if (function_handler) this._functionHandler = function_handler;
      this.cleanConfig(config);
      Object.assign(this.rawBody, config);
    }
    this.maxMessages ??= -1;
    this.rawBody.model ??= 'gpt-4o';
  }

  private cleanConfig(config: OpenAIChat) {
    delete config.system_prompt;
    delete config.function_handler;
  }

  private static getFileContent(files: MessageFile[]): FileContent {
    const content: FileContent = files.map((file) => {
      if (file.type === 'audio') {
        const base64Data = file.src?.split(',')[1];
        const format = file.name?.split('.').pop()?.toLowerCase() || 'wav';
        return {type: 'input_audio', input_audio: {data: base64Data, format}};
      }
      return {type: 'image_url', image_url: {url: file.src}};
    });
    return content;
  }

  private static getContent(message: MessageContentI) {
    if (message.files && message.files.length > 0) {
      const content: FileContent = OpenAIChatIO.getFileContent(message.files);
      if (message.text && message.text.trim().length > 0) content.unshift({type: 'text', [TEXT_KEY]: message.text});
      return content;
    }
    return message.text;
  }

  // prettier-ignore
  private preprocessBody(body: OpenAIConverseBodyInternal, pMessages: MessageContentI[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body));
    const processedMessages = MessageLimitUtils.getCharacterLimitMessages(pMessages,
        this.totalMessagesMaxCharLength ? this.totalMessagesMaxCharLength - this._systemMessage.length : -1)
      .map((message) => {
        return {content: OpenAIChatIO.getContent(message),
          role: message.role === MessageUtils.USER_ROLE ? 'user' : 'assistant'};});
    if (this._systemMessage) {
      processedMessages.unshift({role: 'system', content: this._systemMessage});
    }
    bodyCopy.messages = processedMessages;
    return bodyCopy;
  }

  override async callServiceAPI(messages: Messages, pMessages: MessageContentI[]) {
    this._messages ??= messages;
    this.callDirectServiceServiceAPI(messages, pMessages, this.preprocessBody.bind(this), {});
  }

  override async extractResultData(result: OpenAIConverseResult, prevBody?: OpenAIChat): Promise<ResponseI> {
    if (result.error) throw result.error.message;
    if (result.choices?.[0]?.delta) {
      return this.extractStreamResult(result.choices[0], prevBody);
    }
    if (result.choices?.[0]?.message) {
      if (result.choices[0].message.tool_calls) {
        return this.handleToolsGeneric(result.choices[0].message, this._functionHandler, this._messages, prevBody);
      }
      if (result.choices[0].message?.audio) {
        const tts = this.deepChat.textToSpeech;
        const displayText = typeof tts === 'object' && typeof tts?.service?.displayText === 'boolean';
        return {
          files: [{src: `data:audio/wav;base64,${result.choices[0].message.audio.data}`, type: 'audio'}],
          [TEXT_KEY]: displayText ? result.choices[0].message.audio.transcript : undefined,
        };
      }
      return {[TEXT_KEY]: result.choices[0].message.content};
    }
    return {[TEXT_KEY]: ''};
  }

  private async extractStreamResult(choice: ResultChoice, prevBody?: OpenAIChat) {
    return this.extractStreamResultWToolsGeneric(this, choice, this._functionHandler, this._messages, prevBody);
  }
}
