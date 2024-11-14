import {DirectConnection} from '../../../types/directConnection';
import {Response as ResponseI} from '../../../types/response';
import {OpenAIAssistantIOI} from './openAIAssistantIOI';
import {OpenAIAssistant} from '../../../types/openAI';
import {OpenAIUtils} from '../utils/openAIUtils';
import {DeepChat} from '../../../deepChat';

export class OpenAIAssistantIO extends OpenAIAssistantIOI {
  fetchHistory?: () => Promise<ResponseI[]>;
  private static readonly URL_SEGMENTS = {
    threadsPrefix: 'https://api.openai.com/v1/threads',
    threadsPosfix: '',
    newAssistantUrl: 'https://api.openai.com/v1/assistants',
    createMessagePostfix: '',
    listMessagesPostfix: 'order=desc',
    storeFiles: 'https://api.openai.com/v1/files',
    getFilesPrefix: 'https://api.openai.com/v1/files/',
    getFilesPostfix: '/content',
  };

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = JSON.parse(JSON.stringify(deepChat.directConnection)) as DirectConnection;
    const apiKey = directConnectionCopy.openAI;
    const config = directConnectionCopy.openAI?.assistant;
    // prettier-ignore
    super(deepChat, config, OpenAIAssistantIO.URL_SEGMENTS, OpenAIUtils.buildKeyVerificationDetails(),
      OpenAIUtils.buildHeaders, apiKey);
    this.connectSettings.headers ??= {};
    this.connectSettings.headers['OpenAI-Beta'] ??= 'assistants=v2'; // runs keep failing but keep trying
    if (this.shouldFetchHistory && this.sessionId) this.fetchHistory = this.fetchHistoryFunc.bind(this);
    if (typeof config === 'object') {
      const {function_handler, files_tool_type} = deepChat.directConnection?.openAI?.assistant as OpenAIAssistant;
      if (function_handler) this.functionHandler = function_handler;
      if (files_tool_type) this.filesToolType = files_tool_type;
    }
  }
}
