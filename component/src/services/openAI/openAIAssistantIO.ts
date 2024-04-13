import {AssistantFunctionHandler, OpenAIAssistant, OpenAINewAssistant} from '../../types/openAI';
import {MessageStream} from '../../views/chat/messages/stream/messageStream';
import {OpenAIConverseBodyInternal} from '../../types/openAIInternal';
import {OpenAIAssistantUtils} from './utils/openAIAssistantUtils';
import {DirectConnection} from '../../types/directConnection';
import {MessageLimitUtils} from '../utils/messageLimitUtils';
import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {Response as ResponseI} from '../../types/response';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {DirectServiceIO} from '../utils/directServiceIO';
import {OpenAIUtils} from './utils/openAIUtils';
import {Stream} from '../../utils/HTTP/stream';
import {DeepChat} from '../../deepChat';
import {PollResult} from '../serviceIO';
import {
  OpenAIAssistantMessagesResult,
  OpenAIAssistantInitReqResult,
  OpenAINewAssistantResult,
  OpenAIRunResult,
  ToolCalls,
} from '../../types/openAIResult';

export class OpenAIAssistantIO extends DirectServiceIO {
  override insertKeyPlaceholderText = 'OpenAI API Key';
  override keyHelpUrl = 'https://platform.openai.com/account/api-keys';
  url = ''; // set dynamically
  private static readonly THREAD_PREFIX = 'https://api.openai.com/v1/threads';
  private static readonly NEW_ASSISTANT_URL = 'https://api.openai.com/v1/assistants';
  private static readonly POLLING_TIMEOUT_MS = 800;
  private readonly _functionHandler?: AssistantFunctionHandler;
  permittedErrorPrefixes = ['Incorrect'];
  private messages?: Messages;
  private run_id?: string;
  private searchedForThreadId = false;
  private readonly config: OpenAIAssistant = {};
  private readonly newAssistantDetails: OpenAINewAssistant = {model: 'gpt-4'};
  private readonly shouldFetchHistory: boolean = false;
  private waitingForStreamResponse = false;
  private readonly isSSEStream: boolean = false;
  private streamedMessageId: string | undefined;
  private messageStream: MessageStream | undefined;
  fetchHistory?: () => Promise<ResponseI[]>;

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = JSON.parse(JSON.stringify(deepChat.directConnection)) as DirectConnection;
    const apiKey = directConnectionCopy.openAI;
    super(deepChat, OpenAIUtils.buildKeyVerificationDetails(), OpenAIUtils.buildHeaders, apiKey);
    const config = directConnectionCopy.openAI?.assistant; // can be undefined as this is the default service
    if (typeof config === 'object') {
      this.config = config; // stored that assistant_id could be added
      const {new_assistant, thread_id, load_thread_history} = this.config;
      Object.assign(this.newAssistantDetails, new_assistant);
      if (thread_id) this.sessionId = thread_id;
      if (load_thread_history) this.shouldFetchHistory = true;
      const {function_handler} = deepChat.directConnection?.openAI?.assistant as OpenAIAssistant;
      if (function_handler) this._functionHandler = function_handler;
    } else if (directConnectionCopy.openAI?.assistant) {
      directConnectionCopy.openAI.assistant = config;
    }
    this.connectSettings.headers ??= {};
    this.connectSettings.headers['OpenAI-Beta'] ??= 'assistants=v1';
    this.maxMessages = 1; // messages are stored in OpenAI threads and can't create new thread with 'assistant' messages
    this.isSSEStream = Boolean(this.stream && (typeof this.stream !== 'object' || !this.stream.simulation));
    if (this.shouldFetchHistory && this.sessionId) this.fetchHistory = this.fetchHistoryFunc.bind(this);
  }

  private async fetchHistoryFunc() {
    setTimeout(() => this.deepChat.disableSubmitButton(), 2); // not initialised when fetchHistoryFunc called
    try {
      const threadMessages = await this.getThreadMessages(this.sessionId as string, true);
      this.deepChat.disableSubmitButton(false);
      return threadMessages.reverse();
    } catch (e) {
      return [{error: 'failed to fetch thread history'}];
    }
  }

  private processMessage(pMessages: MessageContentI[], file_ids?: string[]) {
    const totalMessagesMaxCharLength = this.totalMessagesMaxCharLength || -1;
    // pMessages only conytains one message due to maxMessages being set to 1
    const processedMessage = MessageLimitUtils.getCharacterLimitMessages(pMessages, totalMessagesMaxCharLength)[0];
    return {content: processedMessage.text || '', role: 'user', file_ids};
  }

  private createNewThreadMessages(body: OpenAIConverseBodyInternal, pMessages: MessageContentI[], file_ids?: string[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body));
    const processedMessage = this.processMessage(pMessages, file_ids);
    bodyCopy.thread = {messages: [processedMessage]};
    return bodyCopy;
  }

  private callService(messages: Messages, pMessages: MessageContentI[], file_ids?: string[]) {
    this.messages = messages;
    if (this.sessionId) {
      // https://platform.openai.com/docs/api-reference/messages/createMessage
      this.url = `${OpenAIAssistantIO.THREAD_PREFIX}/${this.sessionId}/messages`;
      const body = this.processMessage(pMessages, file_ids);
      HTTPRequest.request(this, body, messages);
    } else {
      // https://platform.openai.com/docs/api-reference/runs/createThreadAndRun
      this.url = `${OpenAIAssistantIO.THREAD_PREFIX}/runs`;
      const body = this.createNewThreadMessages(this.rawBody, pMessages, file_ids);
      if (this.isSSEStream) {
        this.createStreamRun(body);
      } else {
        HTTPRequest.request(this, body, messages);
      }
    }
  }

  override async callServiceAPI(messages: Messages, pMessages: MessageContentI[], files?: File[]) {
    this.waitingForStreamResponse = false;
    if (!this.connectSettings) throw new Error('Request settings have not been set up');
    this.rawBody.assistant_id ??= this.config.assistant_id || (await this.createNewAssistant());
    this.streamedMessageId = undefined;
    // here instead of constructor as messages may be loaded later
    if (!this.searchedForThreadId) this.searchPreviousMessagesForThreadId(messages.messages);
    const file_ids = files ? await OpenAIAssistantUtils.storeFiles(this, messages, files) : undefined;
    this.connectSettings.method = 'POST';
    this.callService(messages, pMessages, file_ids);
  }

  private async createNewAssistant() {
    try {
      this.url = OpenAIAssistantIO.NEW_ASSISTANT_URL;
      const result = await OpenAIUtils.directFetch(this, JSON.parse(JSON.stringify(this.newAssistantDetails)), 'POST');
      this.config.assistant_id = (result as OpenAINewAssistantResult).id;
      return this.config.assistant_id;
    } catch (e) {
      console.error(e);
      console.error('Failed to create a new assistant'); // letting later calls throw and handle error
    }
    return undefined;
  }

  private searchPreviousMessagesForThreadId(messages: MessageContentI[]) {
    const messageWithSession = messages.find((message) => message._sessionId);
    if (messageWithSession) this.sessionId = messageWithSession._sessionId;
    this.searchedForThreadId = true;
  }

  // prettier-ignore
  override async extractResultData(result: OpenAIAssistantInitReqResult):
      Promise<ResponseI | {makingAnotherRequest: true}> {
    if (this.waitingForStreamResponse || (this.isSSEStream && this.sessionId)) {
      return await this.handleStream(result);
    }
    if (result.error) throw result.error.message;
    await this.assignThreadAndRun(result);
    // https://platform.openai.com/docs/api-reference/runs/getRun
    const url = `${OpenAIAssistantIO.THREAD_PREFIX}/${this.sessionId}/runs/${this.run_id}`;
    const requestInit = {method: 'GET', headers: this.connectSettings?.headers};
    HTTPRequest.executePollRequest(this, url, requestInit, this.messages as Messages); // poll for run status
    return {makingAnotherRequest: true};
  }

  private async assignThreadAndRun(result: OpenAIAssistantInitReqResult) {
    if (this.sessionId) {
      // https://platform.openai.com/docs/api-reference/runs/createRun
      this.url = `${OpenAIAssistantIO.THREAD_PREFIX}/${this.sessionId}/runs`;
      const runObj = await OpenAIUtils.directFetch(this, JSON.parse(JSON.stringify(this.rawBody)), 'POST');
      this.run_id = runObj.id;
    } else {
      this.sessionId = result.thread_id;
      this.run_id = result.id;
      // updates the user sent message with the session id (the message event sent did not have this id)
      if (this.messages) this.messages.messages[this.messages.messages.length - 1]._sessionId = this.sessionId;
    }
  }

  private async getThreadMessages(thread_id: string, isHistory = false) {
    // https://platform.openai.com/docs/api-reference/messages/listMessages
    this.url = `${OpenAIAssistantIO.THREAD_PREFIX}/${thread_id}/messages`;
    let threadMessages = (await OpenAIUtils.directFetch(this, {}, 'GET')) as OpenAIAssistantMessagesResult;
    if (!isHistory && this.deepChat.responseInterceptor) {
      threadMessages = (await this.deepChat.responseInterceptor?.(threadMessages)) as OpenAIAssistantMessagesResult;
    }
    return OpenAIAssistantUtils.processAPIMessages(this, threadMessages, isHistory);
  }

  async extractPollResultData(result: OpenAIRunResult): PollResult {
    const {status, required_action} = result;
    if (status === 'queued' || status === 'in_progress') return {timeoutMS: OpenAIAssistantIO.POLLING_TIMEOUT_MS};
    if (status === 'completed' && this.messages) {
      const threadMessages = await this.getThreadMessages(result.thread_id);
      const {text, files} = threadMessages.pop() as ResponseI;
      setTimeout(() => {
        threadMessages.forEach((message) => this.deepChat.addMessage(message));
      });
      return {text, _sessionId: this.sessionId, files};
    }
    const toolCalls = required_action?.submit_tool_outputs?.tool_calls;
    if (status === 'requires_action' && toolCalls) {
      return await this.handleTools(toolCalls);
    }
    throw Error(`Thread run status: ${status}`);
  }

  // prettier-ignore
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
    if (!Array.isArray(handlerResponse) || handlerResponse.find((response) => typeof response !== 'string')
        || toolCalls.length !== handlerResponse.length) {
      throw Error('Response must contain an array of strings for each individual function/tool_call, '
        + 'see https://deepchat.dev/docs/directConnection/OpenAI/#assistant-functions.');
    }
    const tool_outputs = handlerResponse.map((resp, index) => {
      return {tool_call_id: toolCalls[index].id, output: resp};
    });
    // https://platform.openai.com/docs/api-reference/runs/submitToolOutputs
    this.url = `${OpenAIAssistantIO.THREAD_PREFIX}/${this.sessionId}/runs/${this.run_id}/submit_tool_outputs`;
    if (this.isSSEStream) {
      await this.createStreamRun({tool_outputs});
    } else {
      await OpenAIUtils.directFetch(this, {tool_outputs}, 'POST');
    }
    return {timeoutMS: OpenAIAssistantIO.POLLING_TIMEOUT_MS};
  }

  private async handleStream(result: OpenAIAssistantInitReqResult) {
    const toolCalls = result.required_action?.submit_tool_outputs?.tool_calls;
    if (result.status === 'requires_action' && toolCalls) {
      this.run_id = result.id;
      return await this.handleTools(toolCalls);
    }
    if (this.waitingForStreamResponse) {
      return this.parseStreamResult(result);
    }
    if (this.isSSEStream && this.sessionId) {
      // https://platform.openai.com/docs/api-reference/runs/createRun
      this.url = `${OpenAIAssistantIO.THREAD_PREFIX}/${this.sessionId}/runs`;
      const newBody = JSON.parse(JSON.stringify(this.rawBody));
      this.createStreamRun(newBody);
    }
    return {makingAnotherRequest: true};
  }

  // prettier-ignore
  private async parseStreamResult(result: OpenAIAssistantInitReqResult) {
    if (result.content && result.content.length > 0 && this.messages) {
      // if file is included and there is an annotation/link in text, process at the end
      const textContent = result.content.find((content) => content.text);
      if (textContent?.text?.annotations && textContent.text.annotations.length > 0) {
        const downloadCb = OpenAIAssistantUtils.getFilesAndText.bind(this,
          this, {role: 'assistant', content: result.content}, result.content[0]);
        this.messageStream?.endStreamAfterFileDownloaded(this.messages, downloadCb);
        return {text: ''};
      }
    }
    if (result.delta?.content) {
      if (!this.streamedMessageId) {
        this.streamedMessageId = result.id;
      } else if (this.streamedMessageId !== result.id) {
        this.streamedMessageId = result.id;
        this.messageStream?.newMessage();
      }
      if (result.delta.content.length > 1) {
        // if file is included and there is no annotation/link in text, process during the stream
        const textContent = result.delta.content.find((content) => content.text);
        if (textContent?.text?.annotations && textContent.text.annotations.length === 0) {
          const messages = await OpenAIAssistantUtils.processStreamMessages(this, result.delta.content);
          return {text: messages[0].text, files: messages[1].files};
        }
      }
      return {text: result.delta.content[0].text?.value};
    }
    if (!this.sessionId && result.thread_id) {
      this.sessionId = result.thread_id;
    }
    return {makingAnotherRequest: true};
  }

  // https://platform.openai.com/docs/api-reference/assistants-streaming
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async createStreamRun(body: any) {
    body.stream = true;
    this.waitingForStreamResponse = true;
    this.messageStream = (await Stream.request(this, body, this.messages as Messages, true, true)) as MessageStream;
  }
}
