import {OPEN_AI_BUILD_HEADERS, OPEN_AI_BUILD_KEY_VERIFICATION_DETAILS} from './utils/openAIUtils';
import {AUDIO, ERROR, FILES, SRC, TEXT, TYPE} from '../../utils/consts/messageConstants';
import {OpenAIConverseResult, ResultChoice, ToolCalls} from '../../types/openAIResult';
import {KeyVerificationDetails} from '../../types/keyVerificationDetails';
import {INCORRECT_ERROR_PREFIX, OBJECT} from '../utils/serviceConstants';
import {OpenAIConverseBodyInternal} from '../../types/openAIInternal';
import {DirectConnection} from '../../types/directConnection';
import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {Response as ResponseI} from '../../types/response';
import {DirectServiceIO} from '../utils/directServiceIO';
import {BuildHeadersFunc} from '../../types/headers';
import {MessageFile} from '../../types/messageFile';
import {OpenAIChat} from '../../types/openAI';
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
  _streamToolCalls?: ToolCalls;

  // https://platform.openai.com/docs/models/gpt-4o-audio-preview
  // prettier-ignore
  constructor(deepChat: DeepChat, keyVerificationDetailsArg?: KeyVerificationDetails,
      buildHeadersFuncArg?: BuildHeadersFunc, apiKeyArg?: APIKey, configArg?: true | OpenAIChat) {
    const directConnectionCopy = JSON.parse(JSON.stringify(deepChat.directConnection)) as DirectConnection;
    const keyVerificationDetails = keyVerificationDetailsArg || OPEN_AI_BUILD_KEY_VERIFICATION_DETAILS();
    const buildHeadersFunc = buildHeadersFuncArg || OPEN_AI_BUILD_HEADERS;
    const apiKey = apiKeyArg || directConnectionCopy.openAI;
    super(deepChat, keyVerificationDetails, buildHeadersFunc, apiKey);
    // can be undefined as this is the default service
    const config = (configArg || directConnectionCopy.openAI?.chat) as OpenAIChat;
    if (typeof config === OBJECT) {
      this.completeConfig(config, (deepChat.directConnection?.openAI?.chat as OpenAIChat)?.function_handler);
    }
    this.maxMessages ??= -1;
    this.rawBody.model ??= 'gpt-4o';
  }

  private static getFileContent(files: MessageFile[]): FileContent {
    const content: FileContent = files.map((file) => {
      if (file.type === AUDIO) {
        const base64Data = file.src?.split(',')[1];
        const format = file.name?.split('.').pop()?.toLowerCase() || 'wav';
        return {[TYPE]: 'input_audio', input_audio: {data: base64Data, format}};
      }
      return {[TYPE]: 'image_url', image_url: {url: file.src}};
    });
    return content;
  }

  private static getContent(message: MessageContentI) {
    if (message[FILES] && message[FILES].length > 0) {
      const content: FileContent = OpenAIChatIO.getFileContent(message[FILES]);
      if (message[TEXT] && message[TEXT].trim().length > 0) content.unshift({[TYPE]: TEXT, [TEXT]: message[TEXT]});
      return content;
    }
    return message[TEXT];
  }

  private preprocessBody(body: OpenAIConverseBodyInternal, pMessages: MessageContentI[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body));
    const processedMessages = this.processMessages(pMessages).map((message) => ({
      content: OpenAIChatIO.getContent(message),
      role: DirectServiceIO.getRoleViaUser(message.role),
    }));
    this.addSystemMessage(processedMessages);
    bodyCopy.messages = processedMessages;
    return bodyCopy;
  }

  override async callServiceAPI(messages: Messages, pMessages: MessageContentI[]) {
    this.messages ??= messages;
    this.callDirectServiceServiceAPI(messages, pMessages, this.preprocessBody.bind(this), {});
  }

  override async extractResultData(result: OpenAIConverseResult, prevBody?: OpenAIChat): Promise<ResponseI> {
    if (result[ERROR]) throw result[ERROR].message;
    if (result.choices?.[0]?.delta) {
      return this.extractStreamResult(result.choices[0], prevBody);
    }
    if (result.choices?.[0]?.message) {
      if (result.choices[0].message.tool_calls) {
        return this.handleToolsGeneric(result.choices[0].message, this.functionHandler, this.messages, prevBody);
      }
      if (result.choices[0].message?.[AUDIO]) {
        const tts = this.deepChat.textToSpeech;
        const displayText = typeof tts === 'object' && typeof tts?.[AUDIO]?.displayText === 'boolean';
        return {
          [FILES]: [{[SRC]: `data:audio/wav;base64,${result.choices[0].message[AUDIO].data}`, [TYPE]: AUDIO}],
          [TEXT]: displayText ? result.choices[0].message[AUDIO].transcript : undefined,
        };
      }
      return {[TEXT]: result.choices[0].message.content};
    }
    return {[TEXT]: ''};
  }

  private async extractStreamResult(choice: ResultChoice, prevBody?: OpenAIChat) {
    return this.extractStreamResultWToolsGeneric(this, choice, this.functionHandler, prevBody);
  }
}
