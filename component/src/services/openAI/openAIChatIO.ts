import {DEFINE_FUNCTION_HANDLER, FUNCTION_TOOL_RESPONSE_STRUCTURE_ERROR} from '../../utils/errorMessages/errorMessages';
import {AUDIO, ERROR, FILES, IMAGE, SRC, TEXT, TYPE, USER} from '../../utils/consts/messageConstants';
import {OPEN_AI_BUILD_HEADERS, OPEN_AI_BUILD_KEY_VERIFICATION_DETAILS} from './utils/openAIUtils';
import {OpenAIFileContent, OpenAIConverseBodyInternal} from '../../types/openAIInternal';
import {FUNCTION_CALL, INCORRECT_ERROR_PREFIX, OBJECT} from '../utils/serviceConstants';
import {KeyVerificationDetails} from '../../types/keyVerificationDetails';
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
import {
  ResponsesImageGenerationCall,
  ResponsesFunctionCall,
  OpenAIMessage,
  OpenAIResult,
  OpenAIOutput,
} from '../../types/openAIResult';

// Have option to make system message developer
// https://platform.openai.com/docs/api-reference/chat/create

export class OpenAIChatIO extends DirectServiceIO {
  override insertKeyPlaceholderText = this.genereteAPIKeyName('OpenAI');
  override keyHelpUrl = 'https://platform.openai.com/account/api-keys';
  // https://platform.openai.com/docs/api-reference/responses
  url = 'https://api.openai.com/v1/responses';
  permittedErrorPrefixes = [INCORRECT_ERROR_PREFIX, 'Invalid value'];
  private _functionStramInProgress = false;
  private static readonly IMAGE_BASE64_PREFIX = 'data:image/png;base64,';

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

  private static getFileContent(files: MessageFile[]): OpenAIFileContent {
    const content: OpenAIFileContent = files.map((file) => {
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
    // Attaching history files only allowed for user
    if (message.role === USER && message[FILES] && message[FILES].length > 0) {
      const content: OpenAIFileContent = OpenAIChatIO.getFileContent(message[FILES]);
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
        const text = (completetdOutputs as OpenAIMessage[]).find((output) => typeof output.content?.[0]?.text === 'string')
          ?.content?.[0]?.text;
        const functionResponse = await this.handleResponsesFunctionCalls(completetdOutputs, prevBody, text);
        if (functionResponse) return functionResponse as ResponseI;
        const fileResponse = this.handleFileGenerationResponse(completetdOutputs, text);
        if (fileResponse) return fileResponse as ResponseI;
        return {[TEXT]: text};
      }
      return {[TEXT]: ''};
    }
    if (result.item?.type === FUNCTION_CALL && result.type) {
      return this.handleStreamedResponsesFunctionCall(result, prevBody);
    }
    if (result.type === 'response.image_generation_call.partial_image' && result.partial_image_b64) {
      return {[FILES]: [{[SRC]: `${OpenAIChatIO.IMAGE_BASE64_PREFIX}${result.partial_image_b64}`, [TYPE]: IMAGE}]};
    }
    if (result.delta && !this._functionStramInProgress) {
      return {[TEXT]: result.delta};
    }
    return {[TEXT]: ''};
  }

  private async handleStreamedResponsesFunctionCall(result: OpenAIResult, prevBody?: OpenAIChat): Promise<ResponseI> {
    if (result.type === 'response.output_item.done') {
      this._functionStramInProgress = false;
      if (result.item?.type === FUNCTION_CALL) {
        return this.handleResponsesFunctionCalls([result.item], prevBody) as ResponseI;
      }
    } else if (result.type === 'response.output_item.added') {
      this._functionStramInProgress = true;
    }
    return {[TEXT]: ''};
  }

  private handleFileGenerationResponse(completetdOutputs: OpenAIOutput, text?: string) {
    const imageMessage = completetdOutputs.find(
      (output) => output.type === 'image_generation_call'
    ) as ResponsesImageGenerationCall;
    if (imageMessage) {
      return {
        [FILES]: [{[SRC]: `${OpenAIChatIO.IMAGE_BASE64_PREFIX}${imageMessage.result}`, [TYPE]: IMAGE}],
        [TEXT]: text,
      };
    }
    return null;
  }

  private async handleResponsesFunctionCalls(completetdOutputs: OpenAIOutput, prevBody?: OpenAIChat, text?: string) {
    const functionCalls = completetdOutputs.filter((call) => call.type === FUNCTION_CALL) as ResponsesFunctionCall[];
    if (functionCalls.length === 0) return null;
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
        return this.makeAnotherRequest(bodyCp, this.messages, text);
      }
    }
    throw Error(FUNCTION_TOOL_RESPONSE_STRUCTURE_ERROR);
  }
}
