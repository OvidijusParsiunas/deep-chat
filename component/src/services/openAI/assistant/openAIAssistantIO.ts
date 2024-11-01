import {DirectConnection} from '../../../types/directConnection';
import {Response as ResponseI} from '../../../types/response';
import {OpenAIAssistantIOI} from './openAIAssistantIOI';
import {DeepChat} from '../../../deepChat';
import {OpenAIUtils} from '../utils/openAIUtils';

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
    super(deepChat, config, OpenAIAssistantIO.URL_SEGMENTS, OpenAIUtils.buildHeaders, apiKey);
    this.connectSettings.headers ??= {};
    this.connectSettings.headers['OpenAI-Beta'] ??= 'assistants=v2'; // runs keep failing but keep trying
    if (this.shouldFetchHistory && this.sessionId) this.fetchHistory = this.fetchHistoryFunc.bind(this);
  }
}
