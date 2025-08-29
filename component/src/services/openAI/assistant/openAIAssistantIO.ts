import {DirectConnection} from '../../../types/directConnection';
import {Response as ResponseI} from '../../../types/response';
import {OpenAIAssistantIOI} from './openAIAssistantIOI';
import {OpenAIAssistant} from '../../../types/openAI';
import {OpenAIUtils} from '../utils/openAIUtils';
import {DeepChat} from '../../../deepChat';

export class OpenAIAssistantIO extends OpenAIAssistantIOI {
  fetchHistory?: () => Promise<ResponseI[]>;

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = JSON.parse(JSON.stringify(deepChat.directConnection)) as DirectConnection;
    const apiKey = directConnectionCopy.openAI;
    const config = directConnectionCopy.openAI?.assistant;
    const urlSegments = OpenAIAssistantIO.buildUrlSegments(config);
    super(deepChat, config, urlSegments, OpenAIUtils.buildKeyVerificationDetails(), OpenAIUtils.buildHeaders, apiKey);
    this.connectSettings.headers ??= {};
    this.connectSettings.headers['OpenAI-Beta'] ??= 'assistants=v2'; // runs keep failing but keep trying
    if (this.shouldFetchHistory && this.sessionId) this.fetchHistory = this.fetchHistoryFunc.bind(this);
    if (typeof config === 'object') {
      const {function_handler, files_tool_type} = deepChat.directConnection?.openAI?.assistant as OpenAIAssistant;
      if (function_handler) this.functionHandler = function_handler;
      if (files_tool_type) this.filesToolType = files_tool_type;
    }
  }

  private static buildUrlSegments(config: true | OpenAIAssistant | undefined) {
    const baseUrl = (typeof config === 'object' && config.custom_base_url) || 'https://api.openai.com/v1';
    return {
      threadsPrefix: `${baseUrl}/threads`,
      threadsPosfix: '',
      newAssistantUrl: `${baseUrl}/assistants`,
      createMessagePostfix: '',
      listMessagesPostfix: 'order=desc',
      storeFiles: `${baseUrl}/files`,
      getFilesPrefix: `${baseUrl}/files/`,
      getFilesPostfix: '/content',
    };
  }
}
