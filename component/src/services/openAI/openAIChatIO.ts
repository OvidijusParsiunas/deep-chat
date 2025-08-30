import {OpenAIConverseResult, ResultChoice, ToolAPI, ToolCalls} from '../../types/openAIResult';
import {OpenAIConverseBodyInternal, SystemMessageInternal} from '../../types/openAIInternal';
import {KeyVerificationDetails} from '../../types/keyVerificationDetails';
import {MessageUtils} from '../../views/chat/messages/utils/messageUtils';
import {ErrorMessages} from '../../utils/errorMessages/errorMessages';
import {ChatFunctionHandler, OpenAIChat} from '../../types/openAI';
import {DirectConnection} from '../../types/directConnection';
import {MessageLimitUtils} from '../utils/messageLimitUtils';
import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {Response as ResponseI} from '../../types/response';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {DirectServiceIO} from '../utils/directServiceIO';
import {BuildHeadersFunc} from '../../types/headers';
import {MessageFile} from '../../types/messageFile';
import {OpenAIUtils} from './utils/openAIUtils';
import {Stream} from '../../utils/HTTP/stream';
import {APIKey} from '../../types/APIKey';
import {DeepChat} from '../../deepChat';

type ImageContent = {type: string; image_url?: {url?: string}; text?: string}[];

export class OpenAIChatIO extends DirectServiceIO {
  override insertKeyPlaceholderText = 'OpenAI API Key';
  override keyHelpUrl = 'https://platform.openai.com/account/api-keys';
  // https://platform.openai.com/docs/api-reference/chat/create
  url = 'https://api.openai.com/v1/chat/completions';
  permittedErrorPrefixes = ['Incorrect'];
  _functionHandler?: ChatFunctionHandler;
  private _streamToolCalls?: ToolCalls;
  private readonly _systemMessage: SystemMessageInternal =
    OpenAIChatIO.generateSystemMessage('You are a helpful assistant.');
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
    const config = configArg || directConnectionCopy.openAI?.chat; // can be undefined as this is the default service
    if (typeof config === 'object') {
      if (config.system_prompt) this._systemMessage = OpenAIChatIO.generateSystemMessage(config.system_prompt);
      const function_handler = (deepChat.directConnection?.openAI?.chat as OpenAIChat)?.function_handler;
      if (function_handler) this._functionHandler = function_handler;
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

  private static getFileContent(files: MessageFile[], canSendAudio: boolean): ImageContent {
    const content: ImageContent = files.map((file) => {
      // Last time I checked only wav and mp3 are supported
      if (file.type === 'audio' && canSendAudio) {
        // Extract base64 data from data URL (remove "data:audio/format;base64," prefix)
        const base64Data = file.src?.split(',')[1];
        // Extract format from data URL (e.g., "data:audio/wav;base64," -> "wav")
        const format = file.src?.match(/data:audio\/([^;]+)/)?.[1] || 'wav';
        return {type: 'input_audio', input_audio: {data: base64Data, format}};
      }
      return {type: 'image_url', image_url: {url: file.src}};
    });
    return content;
  }

  private static getContent(message: MessageContentI, canSendAudio: boolean) {
    if (message.files && message.files.length > 0) {
      const content: ImageContent = OpenAIChatIO.getFileContent(message.files, canSendAudio);
      if (message.text && message.text.trim().length > 0) content.unshift({type: 'text', text: message.text});
      return content;
    }
    return message.text;
  }

  // prettier-ignore
  private preprocessBody(body: OpenAIConverseBodyInternal, pMessages: MessageContentI[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body));
    const canSendAudio = bodyCopy.modalities?.includes('audio');
    const processedMessages = MessageLimitUtils.getCharacterLimitMessages(pMessages,
        this.totalMessagesMaxCharLength ? this.totalMessagesMaxCharLength - this._systemMessage.content.length : -1)
      .map((message) => {
        return {content: OpenAIChatIO.getContent(message, canSendAudio),
          role: message.role === MessageUtils.USER_ROLE ? 'user' : 'assistant'};});
    if (pMessages.find((message) => message.files && message.files.length > 0)) {
      bodyCopy.max_tokens ??= 300; // otherwise AI does not return full responses - remove when this behaviour changes
    }
    bodyCopy.messages = [this._systemMessage, ...processedMessages];
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

  override async extractResultData(result: OpenAIConverseResult, prevBody?: OpenAIChat): Promise<ResponseI> {
    if (result.error) throw result.error.message;
    if (result.choices?.[0]?.delta) {
      return this.extractStreamResult(result.choices[0], prevBody);
    }
    if (result.choices?.[0]?.message) {
      if (result.choices[0].message.tool_calls) {
        return this.handleTools(result.choices[0].message, prevBody);
      }
      if (result.choices[0].message?.audio) {
        const tts = this.deepChat.textToSpeech;
        const displayText = typeof tts === 'object' && typeof tts?.service?.displayText === 'boolean';
        return {
          files: [{src: `data:audio/wav;base64,${result.choices[0].message.audio.data}`, type: 'audio'}],
          text: displayText ? result.choices[0].message.audio.transcript : undefined,
        };
      }
      return {text: result.choices[0].message.content};
    }
    return {text: ''};
  }

  private async extractStreamResult(choice: ResultChoice, prevBody?: OpenAIChat) {
    const {delta, finish_reason} = choice;
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

  private async handleTools(tools: ToolAPI, prevBody?: OpenAIChat): Promise<ResponseI> {
    // tool_calls, requestFunc and prevBody should theoretically be defined
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
    throw Error(OpenAIUtils.FUNCTION_TOOL_RESP_ERROR);
  }
}
