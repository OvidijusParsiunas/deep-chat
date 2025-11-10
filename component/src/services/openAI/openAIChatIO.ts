import {COMPLETED, FUNCTION_CALL, GET, IMAGE_URL, INPUT_AUDIO, OBJECT, POST} from '../utils/serviceConstants';
import {AI, ERROR, FILES, IMAGE, SRC, TEXT, TYPE, USER} from '../../utils/consts/messageConstants';
import {OpenAIFileContent, OpenAIConverseBodyInternal} from '../../types/openAIInternal';
import {KeyVerificationDetails} from '../../types/keyVerificationDetails';
import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {Response as ResponseI} from '../../types/response';
import {OPEN_AI_DIRECT_FETCH} from './utils/openAIUtils';
import {DirectServiceIO} from '../utils/directServiceIO';
import {BuildHeadersFunc} from '../../types/headers';
import {MessageFile} from '../../types/messageFile';
import {OpenAIChat} from '../../types/openAI';
import {OpenAIBaseIO} from './openAIBaseIO';
import {APIKey} from '../../types/APIKey';
import {DeepChat} from '../../deepChat';
import {
  ResponsesImageGenerationCall,
  ResponsesFunctionCall,
  OpenAIMessage,
  OpenAIResult,
  OpenAIOutput,
} from '../../types/openAIResult';
import {
  FUNCTION_TOOL_RESPONSE_STRUCTURE_ERROR,
  DEFINE_FUNCTION_HANDLER,
  FAILED_TO_FETCH_HISTORY,
} from '../../utils/errorMessages/errorMessages';
import {
  IMAGE_GENERATION_CALL,
  OPEN_AI_KEY_HELP_URL,
  FUNCTION_CALL_OUTPUT,
  OPEN_AI_BASE_URL,
  OUTPUT_TEXT,
  INPUT_IMAGE,
  INPUT_TEXT,
  RESPONSE,
} from './openAIConsts';

export class OpenAIChatIO extends OpenAIBaseIO {
  override keyHelpUrl = OPEN_AI_KEY_HELP_URL;
  // https://platform.openai.com/docs/api-reference/responses
  url = `${OPEN_AI_BASE_URL}responses`;
  private _functionStreamInProgress = false;
  private static readonly IMAGE_BASE64_PREFIX = 'data:image/png;base64,';
  private _conversationId?: string;
  private readonly _useConversation: boolean = false;
  private readonly _conversationLoadLimit?: number = 50;
  fetchHistory?: () => Promise<ResponseI[]>;

  // https://platform.openai.com/docs/models/gpt-4o-audio-preview
  // prettier-ignore
  constructor(deepChat: DeepChat, keyVerificationDetailsArg?: KeyVerificationDetails,
      buildHeadersFuncArg?: BuildHeadersFunc, apiKeyArg?: APIKey, configArg?: true | OpenAIChat) {
    super(deepChat, keyVerificationDetailsArg, buildHeadersFuncArg, apiKeyArg, configArg);

    const config = configArg || deepChat.directConnection?.openAI?.chat;
    if (typeof config === OBJECT && config !== true && config) {
      if (config.conversation) {
        this._useConversation = true;
        if (typeof config.conversation === 'string') this._conversationId = config.conversation;
      }
      if (typeof config.conversationLoadLimit === 'number') this._conversationLoadLimit = config.conversationLoadLimit;
      this.cleanConfig(config);
    }
    if (this._conversationId) this.fetchHistory = this.fetchHistoryFunc.bind(this);
  }

  protected override processConfig(config: OpenAIChat, deepChat: DeepChat) {
    super.processConfig(config, deepChat);
  }

  private cleanConfig(config: OpenAIChat) {
    delete config.conversation;
    delete config.conversationLoadLimit;
  }

  private static getFileContent(files: MessageFile[]): OpenAIFileContent {
    const baseContent = OpenAIBaseIO.getBaseFileContent(files);
    return baseContent.map((file) => {
      if (file.type === INPUT_AUDIO) {
        return file;
      }
      return {detail: 'auto', [TYPE]: INPUT_IMAGE, [IMAGE_URL]: (file as MessageFile)[SRC]};
    }) as OpenAIFileContent;
  }

  private static getContent(message: MessageContentI) {
    // Attaching history files only allowed for user
    const shouldIncludeFiles = message.role === USER;
    if (shouldIncludeFiles && message[FILES] && message[FILES].length > 0) {
      const content: OpenAIFileContent = OpenAIChatIO.getFileContent(message[FILES]);
      if (message[TEXT] && message[TEXT].trim().length > 0) content.unshift({[TYPE]: INPUT_TEXT, [TEXT]: message[TEXT]});
      return content;
    }
    return message[TEXT];
  }

  private async fetchHistoryFunc(): Promise<ResponseI[]> {
    setTimeout(() => this.deepChat.disableSubmitButton(), 2);
    try {
      const originalUrl = this.url;
      this.url = `${OPEN_AI_BASE_URL}conversations/${this._conversationId}/items?limit=${this._conversationLoadLimit}`;
      const conversationData = await OPEN_AI_DIRECT_FETCH(this, {}, GET);
      this.connectSettings.method = POST;
      this.url = originalUrl;
      this.deepChat.disableSubmitButton(false);
      return this.processConversationHistory(conversationData);
    } catch (_) {
      this.deepChat.disableSubmitButton(false);
      return [{[ERROR]: FAILED_TO_FETCH_HISTORY}];
    }
  }

  private static filterCompleted(data?: OpenAIOutput) {
    return data?.filter((output) => output.status === COMPLETED) || [];
  }

  private processConversationHistory(conversationData: {data: OpenAIOutput}): ResponseI[] {
    if (!conversationData.data || !Array.isArray(conversationData.data)) return [];
    const messages: ResponseI[] = [];
    for (const item of OpenAIChatIO.filterCompleted(conversationData.data.reverse())) {
      if (item.type === 'message' && item.content && Array.isArray(item.content)) {
        for (const content of item.content) {
          if ((content.type === INPUT_TEXT || content.type === OUTPUT_TEXT) && content[TEXT]) {
            messages.push({role: item.role, [TEXT]: content[TEXT]});
          } else if (content.type === INPUT_IMAGE) {
            messages.push({
              role: item.role,
              [FILES]: OpenAIChatIO.generateImageFile(content[IMAGE_URL] || ''),
            });
          }
        }
      } else if (item.type === IMAGE_GENERATION_CALL) {
        messages.push({
          role: AI,
          [FILES]: OpenAIChatIO.generateImageFile((item as ResponsesImageGenerationCall).result),
        });
      }
    }
    return messages;
  }

  private preprocessBody(body: OpenAIConverseBodyInternal, pMessages: MessageContentI[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body));
    pMessages = this.processMessages(pMessages);
    pMessages = this._useConversation ? [pMessages[pMessages.length - 1]] : pMessages;
    const processedMessages = pMessages.map((message) => ({
      content: OpenAIChatIO.getContent(message),
      role: DirectServiceIO.getRoleViaUser(message.role),
    }));
    bodyCopy.input = processedMessages;
    if (this._conversationId) bodyCopy.conversation = this._conversationId;
    return bodyCopy;
  }

  private async createConversation(): Promise<string> {
    try {
      const originalUrl = this.url;
      this.url = `${OPEN_AI_BASE_URL}conversations`;
      const result = await OPEN_AI_DIRECT_FETCH(this, {}, POST);
      this.url = originalUrl;
      return result.id;
    } catch (error) {
      console[ERROR]('Failed to create conversation:', error);
      throw error;
    }
  }

  override async callServiceAPI(messages: Messages, pMessages: MessageContentI[]) {
    this.messages ??= messages;
    if (this._useConversation && !this._conversationId) {
      this._conversationId = await this.createConversation();
    }
    if (this._conversationId) this.updateSessionId(this._conversationId);
    this.callDirectServiceServiceAPI(messages, pMessages, this.preprocessBody.bind(this), {});
  }

  override async extractResultData(result: OpenAIResult, prevBody?: OpenAIChat): Promise<ResponseI> {
    const resultData = await this.extractResult(result, prevBody);
    if (this._conversationId) resultData._sessionId = this._conversationId;
    return resultData;
  }

  private async extractResult(result: OpenAIResult, prevBody?: OpenAIChat): Promise<ResponseI> {
    if (result[ERROR]) throw result[ERROR].message;
    if (result.status) {
      const completedOutputs = OpenAIChatIO.filterCompleted(result.output);
      if (completedOutputs.length > 0) {
        const text = (completedOutputs as OpenAIMessage[]).find(
          (output) => typeof output.content?.[0]?.[TEXT] === 'string'
        )?.content?.[0]?.[TEXT];
        const functionResponse = await this.handleResponsesFunctionCalls(completedOutputs, prevBody, text);
        if (functionResponse) return functionResponse as ResponseI;
        const fileResponse = this.handleFileGenerationResponse(completedOutputs, text);
        if (fileResponse) return fileResponse as ResponseI;
        return {[TEXT]: text};
      }
      return {[TEXT]: ''};
    }
    if (result.item?.type === FUNCTION_CALL && result.type) {
      return this.handleStreamedResponsesFunctionCall(result, prevBody);
    }
    if (result.type === `${RESPONSE}.${IMAGE_GENERATION_CALL}.partial_image` && result.partial_image_b64) {
      return {[FILES]: [{[SRC]: `${OpenAIChatIO.IMAGE_BASE64_PREFIX}${result.partial_image_b64}`, [TYPE]: IMAGE}]};
    }
    if (result.delta && !this._functionStreamInProgress && result.type === `${RESPONSE}.${OUTPUT_TEXT}.delta`) {
      return {[TEXT]: result.delta};
    }
    return {[TEXT]: ''};
  }

  private async handleStreamedResponsesFunctionCall(result: OpenAIResult, prevBody?: OpenAIChat): Promise<ResponseI> {
    if (result.type === `${RESPONSE}.output_item.done`) {
      this._functionStreamInProgress = false;
      if (result.item?.type === FUNCTION_CALL) {
        return this.handleResponsesFunctionCalls([result.item], prevBody) as ResponseI;
      }
    } else if (result.type === `${RESPONSE}.output_item.added`) {
      this._functionStreamInProgress = true;
    }
    return {[TEXT]: ''};
  }

  private handleFileGenerationResponse(completetdOutputs: OpenAIOutput, text?: string) {
    const imageMessage = completetdOutputs.find(
      (output) => output.type === IMAGE_GENERATION_CALL
    ) as ResponsesImageGenerationCall;
    if (imageMessage) {
      return {
        [FILES]: OpenAIChatIO.generateImageFile(imageMessage.result),
        [TEXT]: text,
      };
    }
    return null;
  }

  private static generateImageFile(result: string): MessageFile[] {
    return [{[SRC]: `${OpenAIChatIO.IMAGE_BASE64_PREFIX}${result}`, [TYPE]: IMAGE}];
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
          bodyCp.input.push({type: FUNCTION_CALL_OUTPUT, call_id: functionCall.call_id, output: resp[RESPONSE]});
        });
        return this.makeAnotherRequest(bodyCp, this.messages, text);
      }
    }
    throw Error(FUNCTION_TOOL_RESPONSE_STRUCTURE_ERROR);
  }
}
