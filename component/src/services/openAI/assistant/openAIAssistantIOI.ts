import {AssistantFunctionHandler, OpenAI, OpenAIAssistant, OpenAINewAssistant} from '../../../types/openAI';
import {ASSISTANT, ERROR, FILES, IMAGES, TEXT, TYPE, USER} from '../../../utils/consts/messageConstants';
import {COMPLETED, GET, INCORRECT_ERROR_PREFIX, POST} from '../../utils/serviceConstants';
import {FileMessageUtils} from '../../../views/chat/messages/utils/fileMessageUtils';
import {MessageContentI, MessageToElements} from '../../../types/messagesInternal';
import {OpenAIAssistantUtils, UploadedFile} from './utils/openAIAssistantUtils';
import {MessageStream} from '../../../views/chat/messages/stream/messageStream';
import {KeyVerificationDetails} from '../../../types/keyVerificationDetails';
import {OpenAIConverseBodyInternal} from '../../../types/openAIInternal';
import {History} from '../../../views/chat/messages/history/history';
import {MessageLimitUtils} from '../../utils/messageLimitUtils';
import {Messages} from '../../../views/chat/messages/messages';
import {Response as ResponseI} from '../../../types/response';
import {HTTPRequest} from '../../../utils/HTTP/HTTPRequest';
import {DirectServiceIO} from '../../utils/directServiceIO';
import {OPEN_AI_DIRECT_FETCH} from '../utils/openAIUtils';
import {BuildHeadersFunc} from '../../../types/headers';
import {OPEN_AI_KEY_HELP_URL} from '../openAIConsts';
import {Stream} from '../../../utils/HTTP/stream';
import {APIKey} from '../../../types/APIKey';
import {DeepChat} from '../../../deepChat';
import {PollResult} from '../../serviceIO';
import {
  OpenAIAssistantMessagesResult,
  OpenAIAssistantInitReqResult,
  OpenAINewAssistantResult,
  OpenAIRunResult,
  ToolCalls,
} from '../../../types/openAIResult';
import {
  DEFINE_FUNCTION_HANDLER,
  FAILED_TO_FETCH_HISTORY,
  REQUEST_SETTINGS_ERROR,
} from '../../../utils/errorMessages/errorMessages';

// https://platform.openai.com/docs/api-reference/messages/createMessage
type MessageContentArr = {
  type: string;
  image_file?: {
    file_id: string;
  };
  text?: string;
}[];

type FileAttachments = {
  file_id: string;
  tools: {type: OpenAIAssistant['files_tool_type']}[];
}[];

export type URLSegments = {
  threadsPrefix: string;
  threadsPosfix: string;
  newAssistantUrl: string;
  createMessagePostfix: string;
  listMessagesPostfix: string;
  storeFiles: string;
  getFilesPrefix: string;
  getFilesPostfix: string;
};

// WORK - need to refactor to be in Responses API
// https://platform.openai.com/docs/guides/responses-vs-chat-completions
export class OpenAIAssistantIOI extends DirectServiceIO {
  override insertKeyPlaceholderText = this.genereteAPIKeyName('OpenAI');
  override keyHelpUrl = OPEN_AI_KEY_HELP_URL;
  url = ''; // set dynamically
  private static readonly POLLING_TIMEOUT_MS = 500;
  permittedErrorPrefixes = [INCORRECT_ERROR_PREFIX, 'Please send text', History.FAILED_ERROR_MESSAGE];
  _functionHandlerI?: AssistantFunctionHandler;
  filesToolType: OpenAIAssistant['files_tool_type'];
  readonly shouldFetchHistory: boolean = false;
  private run_id?: string;
  private _searchedForThreadId = false;
  private readonly _config: OpenAIAssistant = {};
  private readonly _newAssistantDetails: OpenAINewAssistant = {model: 'gpt-4'};
  private _waitingForStreamResponse = false;
  private readonly _isSSEStream: boolean = false;
  private readonly urlSegments: URLSegments;
  private _messageStream: MessageStream | undefined;

  // prettier-ignore
  constructor(deepChat: DeepChat, config: OpenAI['assistant'], urlSegments: URLSegments,
      keyVerificationDetails: KeyVerificationDetails, buildHeadersFunc: BuildHeadersFunc, apiKey?: APIKey) {
    super(deepChat, keyVerificationDetails, buildHeadersFunc, apiKey);
    this.urlSegments = urlSegments;
    if (typeof config === 'object') {
      this._config = config; // stored that assistant_id could be added
      const {new_assistant, thread_id, load_thread_history} = this._config;
      Object.assign(this._newAssistantDetails, new_assistant);
      if (thread_id) this.sessionId = thread_id;
      if (load_thread_history) this.shouldFetchHistory = true;
    }
    this.maxMessages = 1; // messages are stored in OpenAI threads and can't create new thread with 'assistant' messages
    this._isSSEStream = Boolean(this.stream && (typeof this.stream !== 'object' || !this.stream.simulation));
  }

  public async fetchHistoryFunc() {
    setTimeout(() => this.deepChat.disableSubmitButton(), 2); // not initialised when fetchHistoryFunc called
    try {
      const threadMessages = await this.getThreadMessages(this.sessionId as string, true);
      this.deepChat.disableSubmitButton(false);
      return threadMessages;
    } catch (_) {
      return [{[ERROR]: FAILED_TO_FETCH_HISTORY}];
    }
  }

  private static processImageMessage(processedMessage: MessageContentI, uploadedFiles?: UploadedFile[]) {
    const contentArr: MessageContentArr | undefined = uploadedFiles
      ?.filter((file) => FileMessageUtils.isImageFileExtension(file.name))
      .map((file) => {
        return {[TYPE]: 'image_file', image_file: {file_id: file.id}};
      });
    if (contentArr && contentArr.length > 0) {
      if (processedMessage[TEXT] && processedMessage[TEXT].length > 0) {
        contentArr.push({[TYPE]: TEXT, [TEXT]: processedMessage[TEXT]});
      }
      return {content: contentArr, role: USER};
    }
    return undefined;
  }

  private static processAttachmentsMessage(
    processedMessage: MessageContentI,
    uploadedFiles: UploadedFile[],
    toolType: OpenAIAssistant['files_tool_type']
  ) {
    const attachments: FileAttachments = uploadedFiles.map((file) => {
      return {tools: [{[TYPE]: toolType}], file_id: file.id};
    });
    return {attachments, content: [{[TYPE]: TEXT, [TEXT]: processedMessage[TEXT]}], role: USER};
  }

  private processMessage(pMessages: MessageContentI[], uploadedFiles?: UploadedFile[]) {
    const totalMessagesMaxCharLength = this.totalMessagesMaxCharLength || -1;
    // pMessages only conytains one message due to maxMessages being set to 1
    const processedMessage = MessageLimitUtils.getCharacterLimitMessages(pMessages, totalMessagesMaxCharLength)[0];
    // https://platform.openai.com/docs/api-reference/messages/createMessage
    if (uploadedFiles && uploadedFiles.length > 0) {
      let toolType = this.filesToolType;
      // OpenAI also allows multiple tool types for a message but not doing it here as we don't process multiple responses.
      // https://platform.openai.com/docs/assistants/migration/what-has-changed
      // "tools": [
      //   { "type": "file_search" },
      //   { "type": "code_interpreter" }
      // ]
      if (typeof this.filesToolType === 'function') {
        const rToolType = this.filesToolType(uploadedFiles.map(({name}) => name));
        if (rToolType === 'code_interpreter' || rToolType === 'file_search' || rToolType === IMAGES) {
          toolType = rToolType;
        } else {
          console[ERROR](`Tool type "${rToolType}" is not valid`);
          console[ERROR]('Expected "code_interpreter" or "file_search" or "images". Going to default to "images"');
        }
      }
      if (toolType === 'file_search') {
        return OpenAIAssistantIOI.processAttachmentsMessage(processedMessage, uploadedFiles, 'file_search');
      }
      if (toolType === 'code_interpreter') {
        return OpenAIAssistantIOI.processAttachmentsMessage(processedMessage, uploadedFiles, 'code_interpreter');
      }
      const notImage = uploadedFiles.find(({name}) => !FileMessageUtils.isImageFileExtension(name));
      if (notImage) {
        console[ERROR]('The uploaded files contained a non-image file');
        console[ERROR](
          'Make sure only images can be uploaded or define a "code_interpreter" or "file_search"' +
            ' value in the "files_tool_type" property'
        );
        console.warn(
          'Make sure your existing assistant supports these "tools" or specify them in the "new_assistant" property'
        );
      } else {
        const imageMessage = OpenAIAssistantIOI.processImageMessage(processedMessage, uploadedFiles);
        if (imageMessage) return imageMessage;
      }
    }
    return {content: processedMessage[TEXT] || '', role: USER};
  }

  private createNewThreadMessages(body: OpenAIConverseBodyInternal, pMessages: MessageContentI[], files?: UploadedFile[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body));
    const processedMessage = this.processMessage(pMessages, files);
    bodyCopy.thread = {messages: [processedMessage]};
    return bodyCopy;
  }

  private callService(messages: Messages, pMessages: MessageContentI[], uploadedFiles?: UploadedFile[]) {
    this.messages = messages;
    if (this.sessionId) {
      // https://platform.openai.com/docs/api-reference/messages/createMessage
      this.url = `${this.urlSegments.threadsPrefix}/${this.sessionId}/messages${this.urlSegments.createMessagePostfix}`;
      const body = this.processMessage(pMessages, uploadedFiles);
      HTTPRequest.request(this, body, messages);
    } else {
      // https://platform.openai.com/docs/api-reference/runs/createThreadAndRun
      this.url = `${this.urlSegments.threadsPrefix}/runs${this.urlSegments.threadsPosfix}`;
      const body = this.createNewThreadMessages(this.rawBody, pMessages, uploadedFiles);
      if (this._isSSEStream) {
        this.createStreamRun(body);
      } else {
        HTTPRequest.request(this, body, messages);
      }
    }
  }

  override async callServiceAPI(messages: Messages, pMessages: MessageContentI[], files?: File[]) {
    this._waitingForStreamResponse = false;
    if (!this.connectSettings) throw new Error(REQUEST_SETTINGS_ERROR);
    this.rawBody.assistant_id ??= this._config.assistant_id || (await this.createNewAssistant());
    // here instead of constructor as messages may be loaded later
    if (!this._searchedForThreadId) this.searchPreviousMessagesForThreadId(messages.messageToElements);
    const uploadedFiles = files
      ? await OpenAIAssistantUtils.storeFiles(this, messages, files, this.urlSegments.storeFiles)
      : undefined;
    this.connectSettings.method = POST;
    this.callService(messages, pMessages, uploadedFiles);
  }

  private async createNewAssistant() {
    try {
      this.url = this.urlSegments.newAssistantUrl;
      const result = await OPEN_AI_DIRECT_FETCH(this, JSON.parse(JSON.stringify(this._newAssistantDetails)), POST);
      this._config.assistant_id = (result as OpenAINewAssistantResult).id;
      return this._config.assistant_id;
    } catch (e) {
      console[ERROR](e);
      console[ERROR]('Failed to create a new assistant'); // letting later calls throw and handle error
    }
    return undefined;
  }

  private searchPreviousMessagesForThreadId(messageToElements: MessageToElements) {
    const messageWithSession = messageToElements.find(([msgToEls]) => msgToEls._sessionId);
    if (messageWithSession) this.sessionId = messageWithSession[0]._sessionId;
    this._searchedForThreadId = true;
  }

  override async extractResultData(result: OpenAIAssistantInitReqResult): Promise<ResponseI> {
    if (this._waitingForStreamResponse || (this._isSSEStream && this.sessionId)) {
      return await this.handleStream(result);
    }
    if (result[ERROR]) {
      if (result[ERROR].message.startsWith(OpenAIAssistantUtils.FILES_WITH_TEXT_ERROR)) {
        throw Error('Please send text with your file(s)');
      }
      throw result[ERROR].message;
    }
    this.asyncCallInProgress = true;
    await this.assignThreadAndRun(result);
    // https://platform.openai.com/docs/api-reference/runs/getRun
    const url = `${this.urlSegments.threadsPrefix}/${this.sessionId}/runs/${this.run_id}${this.urlSegments.threadsPosfix}`;
    const requestInit = {method: GET, headers: this.connectSettings?.headers};
    HTTPRequest.executePollRequest(this, url, requestInit, this.messages as Messages); // poll for run status
    return {[TEXT]: ''};
  }

  private async assignThreadAndRun(result: OpenAIAssistantInitReqResult) {
    if (this.sessionId) {
      // https://platform.openai.com/docs/api-reference/runs/createRun
      this.url = `${this.urlSegments.threadsPrefix}/${this.sessionId}/runs${this.urlSegments.threadsPosfix}`;
      const runObj = await OPEN_AI_DIRECT_FETCH(this, JSON.parse(JSON.stringify(this.rawBody)), POST);
      this.run_id = runObj.id;
    } else {
      this.sessionId = result.thread_id;
      this.run_id = result.id;
      // updates the user sent message with the session id (the message event sent did not have this id)
      this.updateSessionId(this.sessionId);
    }
  }

  private async getThreadMessages(thread_id: string, isHistory = false) {
    // https://platform.openai.com/docs/api-reference/messages/listMessages
    this.url = `${this.urlSegments.threadsPrefix}/${thread_id}/messages?${this.urlSegments.listMessagesPostfix}`;
    let threadMessages = (await OPEN_AI_DIRECT_FETCH(this, {}, GET)) as OpenAIAssistantMessagesResult;
    if (!isHistory && this.deepChat.responseInterceptor) {
      threadMessages = (await this.deepChat.responseInterceptor?.(threadMessages)) as OpenAIAssistantMessagesResult;
    }
    return OpenAIAssistantUtils.processAPIMessages(this, threadMessages, isHistory, this.urlSegments);
  }

  async extractPollResultData(result: OpenAIRunResult): PollResult {
    const {status, required_action} = result;
    if (status === 'queued' || status === 'in_progress') return {timeoutMS: OpenAIAssistantIOI.POLLING_TIMEOUT_MS};
    if (status === COMPLETED && this.messages) {
      const threadMessages = await this.getThreadMessages(result.thread_id);
      const {text, files} = threadMessages.shift() as ResponseI;
      setTimeout(() => {
        threadMessages.forEach((message) => this.deepChat.addMessage(message));
      });
      return {text, _sessionId: this.sessionId, [FILES]: files};
    }
    const toolCalls = required_action?.submit_tool_outputs?.tool_calls;
    if (status === 'requires_action' && toolCalls) {
      return await this.handleTools(toolCalls);
    }
    throw Error(`Thread run status: ${status}`);
  }

  // prettier-ignore
  private async handleTools(toolCalls: ToolCalls): PollResult {
    if (!this.functionHandler) {
      throw Error(DEFINE_FUNCTION_HANDLER);
    }
    const functions = toolCalls.map((call) => {
      return {name: call.function.name, arguments: call.function.arguments};
    });
    const handlerResponse = await this.functionHandler(functions);
    if (!Array.isArray(handlerResponse) || toolCalls.length !== handlerResponse.length) {
      throw Error(OpenAIAssistantUtils.FUNCTION_TOOL_RESP_ERROR);
    }
    const invidualResponses = await Promise.all(handlerResponse);
    if (invidualResponses.find((response) => typeof response !== 'string')) {
      throw Error(OpenAIAssistantUtils.FUNCTION_TOOL_RESP_ERROR);
    }
    const tool_outputs = invidualResponses.map((resp, index) => {
      return {tool_call_id: toolCalls[index].id, output: resp};
    });
    // https://platform.openai.com/docs/api-reference/runs/submitToolOutputs
    const prefix = `${this.urlSegments.threadsPrefix}/${this.sessionId}`;
    const postfix = `/runs/${this.run_id}/submit_tool_outputs${this.urlSegments.threadsPosfix}`;
    this.url = `${prefix}${postfix}`;
    if (this._isSSEStream) {
      await this.createStreamRun({tool_outputs});
    } else {
      await OPEN_AI_DIRECT_FETCH(this, {tool_outputs}, POST);
    }
    return {timeoutMS: OpenAIAssistantIOI.POLLING_TIMEOUT_MS};
  }

  private async handleStream(result: OpenAIAssistantInitReqResult) {
    const toolCalls = result.required_action?.submit_tool_outputs?.tool_calls;
    if (result.status === 'requires_action' && toolCalls) {
      this.run_id = result.id;
      return await this.handleTools(toolCalls);
    }
    if (this._waitingForStreamResponse) {
      return this.parseStreamResult(result);
    }
    if (this._isSSEStream && this.sessionId) {
      this.asyncCallInProgress = true;
      // https://platform.openai.com/docs/api-reference/runs/createRun
      this.url = `${this.urlSegments.threadsPrefix}/${this.sessionId}/runs${this.urlSegments.threadsPosfix}`;
      const newBody = JSON.parse(JSON.stringify(this.rawBody));
      this.createStreamRun(newBody);
    }
    return {[TEXT]: ''};
  }

  // prettier-ignore
  private async parseStreamResult(result: OpenAIAssistantInitReqResult) {
    if (result.content && result.content.length > 0 && this.messages) {
      // if file is included and there is an annotation/link in text, process at the end
      const textContent = result.content.find((content) => content[TEXT]);
      if (textContent?.[TEXT]?.annotations && textContent[TEXT].annotations.length > 0) {
        const textFileFirst = result.content.find((content) => !!content[TEXT]) || result.content[0];
        const downloadCb = OpenAIAssistantUtils.getFilesAndText.bind(this,
          this, {role: ASSISTANT, content: result.content}, this.urlSegments, textFileFirst);
        this._messageStream?.endStreamAfterFileDownloaded(this.messages, downloadCb);
        return {[TEXT]: ''};
      }
    }
    if (result.delta?.content) {
      if (result.delta.content.length > 1) {
        // if file is included and there is no annotation/link in text, process during the stream
        const textContent = result.delta.content.find((content) => content[TEXT]);
        if (textContent?.[TEXT]?.annotations && textContent[TEXT].annotations.length === 0) {
          const messages = await OpenAIAssistantUtils.processStreamMessages(this, result.delta.content, this.urlSegments);
          return {[TEXT]: messages[0][TEXT], [FILES]: messages[1][FILES]};
        }
      }
      return {[TEXT]: result.delta.content[0][TEXT]?.value};
    }
    if (!this.sessionId && result.thread_id) {
      this.sessionId = result.thread_id;
    }
    return {[TEXT]: ''};
  }

  // https://platform.openai.com/docs/api-reference/assistants-streaming
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async createStreamRun(body: any) {
    body.stream = true;
    this._waitingForStreamResponse = true;
    this._messageStream = (await Stream.request(this, body, this.messages as Messages, true, true)) as MessageStream;
  }
}
