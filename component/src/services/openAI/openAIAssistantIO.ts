import {AssistantFunctionHandler, OpenAIAssistant} from '../../types/openAI';
import {OpenAIConverseBodyInternal} from '../../types/openAIInternal';
import {MessageUtils} from '../../views/chat/messages/messageUtils';
import {DirectConnection} from '../../types/directConnection';
import {MessageLimitUtils} from '../utils/messageLimitUtils';
import {Messages} from '../../views/chat/messages/messages';
import {RequestUtils} from '../../utils/HTTP/requestUtils';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {DirectServiceIO} from '../utils/directServiceIO';
import {MessageContent} from '../../types/messages';
import {OpenAIUtils} from './utils/openAIUtils';
import {DeepChat} from '../../deepChat';
import {PollResult} from '../serviceIO';
import {
  OpenAIAssistantMessagesResult,
  OpenAIAssistantInitReqResult,
  OpenAIRunResult,
  ToolCalls,
} from '../../types/openAIResult';

export class OpenAIAssistantIO extends DirectServiceIO {
  override insertKeyPlaceholderText = 'OpenAI API Key';
  override getKeyLink = 'https://platform.openai.com/account/api-keys';
  url = ''; // set dynamically
  private static readonly THREAD_PREFIX = 'https://api.openai.com/v1/threads';
  private static readonly POLLING_TIMEOUT_MS = 800;
  private readonly _functionHandler?: AssistantFunctionHandler;
  permittedErrorPrefixes = ['Incorrect'];
  private messages?: Messages;
  private thread_id?: string;
  private run_id?: string;
  private searchedForThreadId = false;

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = JSON.parse(JSON.stringify(deepChat.directConnection)) as DirectConnection;
    const apiKey = directConnectionCopy.openAI;
    const imageFiles = deepChat.images ? {images: {files: {maxNumberOfFiles: 10}}} : {};
    super(deepChat, OpenAIUtils.buildKeyVerificationDetails(), OpenAIUtils.buildHeaders, apiKey, imageFiles);
    const config = directConnectionCopy.openAI?.assistant; // can be undefined as this is the default service
    if (typeof config === 'object') {
      this.rawBody.assistant_id = config.assistant_id;
      const {function_handler} = deepChat.directConnection?.openAI?.assistant as OpenAIAssistant;
      if (function_handler) this._functionHandler = function_handler;
    }
    this.requestSettings.headers ??= {};
    this.requestSettings.headers['OpenAI-Beta'] ??= 'assistants=v1';
    this.maxMessages = 1; // messages are stored in OpenAI threads and can't create new thread with 'assistant' messages
  }

  private processMessages(pMessages: MessageContent[]) {
    const totalMessagesMaxCharLength = this.totalMessagesMaxCharLength || OpenAIUtils.CONVERSE_MAX_CHAR_LENGTH;
    return MessageLimitUtils.getCharacterLimitMessages(pMessages, totalMessagesMaxCharLength).map((message) => {
      return {content: message.text, role: message.role === MessageUtils.AI_ROLE ? 'assistant' : 'user'};
    });
  }

  private createNewThreadMessages(body: OpenAIConverseBodyInternal, pMessages: MessageContent[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body));
    const processedMessages = this.processMessages(pMessages);
    bodyCopy.thread = {messages: processedMessages};
    return bodyCopy;
  }

  override async callServiceAPI(messages: Messages, pMessages: MessageContent[]) {
    if (!this.requestSettings) throw new Error('Request settings have not been set up');
    // here instead of constructor as messages may be loaded later
    if (!this.searchedForThreadId) this.searchPreviousMessagesForThreadId(messages.messages);
    this.requestSettings.method = 'POST';
    if (this.thread_id) {
      // https://platform.openai.com/docs/api-reference/messages/createMessage
      this.url = `${OpenAIAssistantIO.THREAD_PREFIX}/${this.thread_id}/messages`;
      const body = this.processMessages([pMessages[pMessages.length - 1]])[0];
      HTTPRequest.request(this, body, messages);
    } else {
      // https://platform.openai.com/docs/api-reference/runs/createThreadAndRun
      this.url = `${OpenAIAssistantIO.THREAD_PREFIX}/runs`;
      const body = this.createNewThreadMessages(this.rawBody, pMessages);
      HTTPRequest.request(this, body, messages);
    }
    this.messages = messages;
  }

  private searchPreviousMessagesForThreadId(messages: MessageContent[]) {
    const messageWithSession = messages.find((message) => message.sessionId);
    if (messageWithSession) this.thread_id = messageWithSession.sessionId;
    this.searchedForThreadId = true;
  }

  override async extractResultData(result: OpenAIAssistantInitReqResult): Promise<{makingAnotherRequest: true}> {
    if (result.error) throw result.error.message;
    await this.assignThreadAndRun(result);
    // https://platform.openai.com/docs/api-reference/runs/getRun
    const url = `${OpenAIAssistantIO.THREAD_PREFIX}/${this.thread_id}/runs/${this.run_id}`;
    const requestInit = {method: 'GET', headers: this.requestSettings?.headers};
    HTTPRequest.executePollRequest(this, url, requestInit, this.messages as Messages); // poll for run status
    return {makingAnotherRequest: true};
  }

  private async assignThreadAndRun(result: OpenAIAssistantInitReqResult) {
    if (this.thread_id) {
      // https://platform.openai.com/docs/api-reference/runs/createRun
      this.url = `${OpenAIAssistantIO.THREAD_PREFIX}/${this.thread_id}/runs`;
      const runObj = await this.directFetch(JSON.parse(JSON.stringify(this.rawBody)));
      this.run_id = runObj.id;
    } else {
      this.thread_id = result.thread_id;
      this.run_id = result.id;
    }
  }

  async extractPollResultData(result: OpenAIRunResult): PollResult {
    const {status, required_action} = result;
    if (status === 'queued' || status === 'in_progress') return {timeoutMS: OpenAIAssistantIO.POLLING_TIMEOUT_MS};
    if (status === 'completed' && this.messages) {
      this.url = `${OpenAIAssistantIO.THREAD_PREFIX}/${result.thread_id}/messages`;
      const threadMessages = (await this.directFetch({}, 'GET')) as OpenAIAssistantMessagesResult;
      const lastMessage = threadMessages.data[0];
      return {text: lastMessage.content[0].text.value, sessionId: this.thread_id};
    }
    const toolCalls = required_action?.submit_tool_outputs?.tool_calls;
    if (status === 'requires_action' && toolCalls) return await this.handleTools(toolCalls);
    throw Error(`Thread run status: ${status}`);
  }

  private async handleTools(toolCalls: ToolCalls): PollResult {
    if (!this._functionHandler) {
      throw Error(
        'Please define the `function_handler` property inside' +
          ' the [openAI](https://deepchat.dev/docs/directConnection/openAI#Assistant) object.'
      );
    }
    const functions = toolCalls.map((call) => {
      return {name: call.function.name, arguments: call.function.arguments};
    });
    const handlerResponse = await this._functionHandler(functions);
    const tool_outputs = handlerResponse.map((resp, index) => {
      return {tool_call_id: toolCalls[index].id, output: resp};
    });
    // https://platform.openai.com/docs/api-reference/runs/submitToolOutputs
    this.url = `${OpenAIAssistantIO.THREAD_PREFIX}/${this.thread_id}/runs/${this.run_id}/submit_tool_outputs`;
    await this.directFetch({tool_outputs});
    return {timeoutMS: OpenAIAssistantIO.POLLING_TIMEOUT_MS};
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async directFetch(body: any, method = 'POST') {
    this.requestSettings.method = method;
    const result = await RequestUtils.fetch(this, this.requestSettings.headers, true, body).then((resp) =>
      RequestUtils.processResponseByType(resp)
    );
    if (result.error) throw result.error.message;
    return result;
  }
}
