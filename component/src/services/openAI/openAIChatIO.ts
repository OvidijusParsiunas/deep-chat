import {DEFINE_FUNCTION_HANDLER, FUNCTION_TOOL_RESPONSE_STRUCTURE_ERROR} from '../../utils/errorMessages/errorMessages';
import {OPEN_AI_BUILD_HEADERS, OPEN_AI_BUILD_KEY_VERIFICATION_DETAILS} from './utils/openAIUtils';
import {OpenAIResult, ResponsesFunctionCall, OpenAIMessage} from '../../types/openAIResult';
import {AUDIO, ERROR, FILES, SRC, TEXT, TYPE} from '../../utils/consts/messageConstants';
import {FUNCTION_CALL, INCORRECT_ERROR_PREFIX, OBJECT} from '../utils/serviceConstants';
import {KeyVerificationDetails} from '../../types/keyVerificationDetails';
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
  image_url?: string;
  input_audio?: {data?: string; format: string};
  text?: string;
}[];

// Have option to make system message developer
// https://platform.openai.com/docs/api-reference/chat/create

export class OpenAIChatIO extends DirectServiceIO {
  override insertKeyPlaceholderText = this.genereteAPIKeyName('OpenAI');
  override keyHelpUrl = 'https://platform.openai.com/account/api-keys';
  // https://platform.openai.com/docs/api-reference/responses
  url = 'https://api.openai.com/v1/responses';
  permittedErrorPrefixes = [INCORRECT_ERROR_PREFIX, 'Invalid value'];
  private _functionStramInProgress = false;

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
      return {detail: 'auto', [TYPE]: 'input_image', image_url: file.src};
    });
    return content;
  }

  private static getContent(message: MessageContentI) {
    if (message[FILES] && message[FILES].length > 0) {
      const content: FileContent = OpenAIChatIO.getFileContent(message[FILES]);
      if (message[TEXT] && message[TEXT].trim().length > 0) content.unshift({[TYPE]: 'input_text', [TEXT]: message[TEXT]});
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
    bodyCopy.input = processedMessages;
    return bodyCopy;
  }

  override async callServiceAPI(messages: Messages, pMessages: MessageContentI[]) {
    this.messages ??= messages;
    this.callDirectServiceServiceAPI(messages, pMessages, this.preprocessBody.bind(this), {});
  }

  override async extractResultData(result: OpenAIResult, prevBody?: OpenAIChat): Promise<ResponseI> {
    if (result[ERROR]) throw result[ERROR].message;
    if (result.status) {
      const completetdOutputs = result.output?.filter((output) => output.status === 'completed');
      if (completetdOutputs && completetdOutputs.length > 0) {
        const firstOutput = completetdOutputs[0];
        if (firstOutput.call_id && (firstOutput as ResponsesFunctionCall).type === FUNCTION_CALL) {
          return this.handleResponsesFunctionCalls(completetdOutputs as ResponsesFunctionCall[], prevBody);
        }
        const message = firstOutput as OpenAIMessage;
        if (message?.[AUDIO]) {
          const tts = this.deepChat.textToSpeech;
          const displayText = typeof tts === 'object' && typeof tts?.[AUDIO]?.displayText === 'boolean';
          return {
            [FILES]: [{[SRC]: `data:audio/wav;base64,${message[AUDIO].data}`, [TYPE]: AUDIO}],
            [TEXT]: displayText ? message[AUDIO].transcript : undefined,
          };
        }
        return {[TEXT]: (message.content as unknown as {text: string}[])[0].text};
      }
      return {[TEXT]: ''};
    }
    if (result.item?.type === FUNCTION_CALL && result.type) {
      return this.handleStreamedResponsesFunctionCall(result, prevBody);
    }
    if (result.delta && !this._functionStramInProgress) {
      return {[TEXT]: result.delta};
    }
    return {[TEXT]: ''};
  }

  private async handleStreamedResponsesFunctionCall(result: OpenAIResult, prevBody?: OpenAIChat): Promise<ResponseI> {
    if (result.type === 'response.output_item.done') {
      this._functionStramInProgress = false;
      if (result.item?.type === FUNCTION_CALL) return this.handleResponsesFunctionCalls([result.item], prevBody);
    } else if (result.type === 'response.output_item.added') {
      this._functionStramInProgress = true;
    }
    return {[TEXT]: ''};
  }

  private async handleResponsesFunctionCalls(
    functionCalls: ResponsesFunctionCall[],
    prevBody?: OpenAIChat
  ): Promise<ResponseI> {
    if (!prevBody || !this.functionHandler) throw Error(DEFINE_FUNCTION_HANDLER);

    const functions = functionCalls.map((call) => ({name: call.name, arguments: call.arguments}));

    const {responses, processedResponse} = await this.callToolFunction(this.functionHandler, functions);
    if (processedResponse) return processedResponse;

    // For responses API, we need to include the original function calls in conversation history
    const bodyCp = JSON.parse(JSON.stringify(prevBody));
    if (bodyCp.input) {
      // Add original function calls to the conversation history which is equired to prevent error based on this thread:
      // eslint-disable-next-line max-len
      // https://community.openai.com/t/issue-with-new-responses-api-400-no-tool-call-found-for-function-call-output-with-call-id/1142327
      functionCalls.forEach((functionCall) => bodyCp.input.push(functionCall));
      // Then add the function call outputs
      if (!responses.find(({response}) => typeof response !== 'string') && functions.length === responses.length) {
        responses.forEach((resp, index) => {
          const functionCall = functionCalls[index];
          bodyCp.input.push({type: 'function_call_output', call_id: functionCall.call_id, output: resp.response});
        });
        return this.makeAnotherRequest(bodyCp, this.messages);
      }
    }
    throw Error(FUNCTION_TOOL_RESPONSE_STRUCTURE_ERROR);
  }
}
