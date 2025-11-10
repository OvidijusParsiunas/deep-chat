import {OPEN_AI_BUILD_HEADERS, OPEN_AI_BUILD_KEY_VERIFICATION_DETAILS} from '../utils/openAIUtils';
import {DirectConnection} from '../../../types/directConnection';
import {Response as ResponseI} from '../../../types/response';
import {FILES} from '../../../utils/consts/messageConstants';
import {OpenAIAssistantIOI} from './openAIAssistantIOI';
import {OpenAIAssistant} from '../../../types/openAI';
import {OBJECT} from '../../utils/serviceConstants';
import {OPEN_AI_BASE_URL} from '../openAIConsts';
import {DeepChat} from '../../../deepChat';

export class OpenAIAssistantIO extends OpenAIAssistantIOI {
  fetchHistory?: () => Promise<ResponseI[]>;

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = JSON.parse(JSON.stringify(deepChat.directConnection)) as DirectConnection;
    const apiKey = directConnectionCopy.openAI;
    const config = directConnectionCopy.openAI?.assistant;
    const urlSegments = OpenAIAssistantIO.buildUrlSegments(config);
    super(deepChat, config, urlSegments, OPEN_AI_BUILD_KEY_VERIFICATION_DETAILS(), OPEN_AI_BUILD_HEADERS, apiKey);
    this.connectSettings.headers ??= {};
    this.connectSettings.headers['OpenAI-Beta'] ??= 'assistants=v2'; // runs keep failing but keep trying
    if (this.shouldFetchHistory && this.sessionId) this.fetchHistory = this.fetchHistoryFunc.bind(this);
    if (typeof config === OBJECT) {
      const {function_handler, files_tool_type} = deepChat.directConnection?.openAI?.assistant as OpenAIAssistant;
      if (function_handler) this._functionHandlerI = function_handler;
      if (files_tool_type) this.filesToolType = files_tool_type;
    }
  }

  private static buildUrlSegments(config: true | OpenAIAssistant | undefined) {
    const baseUrl = (typeof config === 'object' && config.custom_base_url) || OPEN_AI_BASE_URL;
    return {
      threadsPrefix: `${baseUrl}/threads`,
      threadsPosfix: '',
      newAssistantUrl: `${baseUrl}/assistants`,
      createMessagePostfix: '',
      listMessagesPostfix: 'order=desc',
      storeFiles: `${baseUrl}/${FILES}`,
      getFilesPrefix: `${baseUrl}/${FILES}/`,
      getFilesPostfix: '/content',
    };
  }
}
