import {OpenAIAssistantIOI} from '../openAI/assistant/openAIAssistantIOI';
import {ERROR, FILES} from '../../utils/consts/messageConstants';
import {DirectConnection} from '../../types/directConnection';
import {OpenAIAssistant} from '../../types/openAI';
import {OBJECT} from '../utils/serviceConstants';
import {AzureOpenAI} from '../../types/azure';
import {DeepChat} from '../../deepChat';
import {
  AZURE_OPEN_AI_BUILD_KEY_VERIFICATION_DETAILS,
  AZURE_OPEN_AI_VALIDATE_URL_DETAILS,
  AZURE_OPEN_AI_BUILD_HEADERS,
  AZURE_OPEN_AI_URL_DETAILS_ERROR,
} from './utils/azureOpenAIUtils';

export class AzureOpenAIAssistantIO extends OpenAIAssistantIOI {
  private static readonly THREAD_RESOURCE = `threads`;
  private static readonly NEW_ASSISTANT_RESOURCE = 'assistants';
  override permittedErrorPrefixes: string[] = [AZURE_OPEN_AI_URL_DETAILS_ERROR];
  override insertKeyPlaceholderText = this.genereteAPIKeyName('Azure OpenAI');
  override keyHelpUrl =
    'https://learn.microsoft.com/en-us/answers/questions/1193991/how-to-get-the-value-of-openai-api-key';
  isTextInputDisabled = false;

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = JSON.parse(JSON.stringify(deepChat.directConnection)) as DirectConnection;
    const apiKey = directConnectionCopy.azure;
    const config = directConnectionCopy.azure?.openAI;
    const urlDetails = config?.urlDetails || ({} as AzureOpenAI['urlDetails']);
    const commonPrefix = `${config?.urlDetails?.endpoint}/openai/`;
    const commonPostfix = `?api-version=${config?.urlDetails?.version}`;
    const urlSegments = {
      threadsPrefix: `${commonPrefix}${AzureOpenAIAssistantIO.THREAD_RESOURCE}`,
      threadsPosfix: commonPostfix,
      newAssistantUrl: `${commonPrefix}${AzureOpenAIAssistantIO.NEW_ASSISTANT_RESOURCE}${commonPostfix}`,
      createMessagePostfix: commonPostfix,
      listMessagesPostfix: `order=desc&api-version=${config?.urlDetails?.version}`,
      storeFiles: `${commonPrefix}${FILES}${commonPostfix}`,
      getFilesPrefix: `${commonPrefix}${FILES}/`,
      getFilesPostfix: `/content${commonPostfix}`,
    };

    // prettier-ignore
    super(deepChat, config?.assistant, urlSegments,
      AZURE_OPEN_AI_BUILD_KEY_VERIFICATION_DETAILS(urlDetails), AZURE_OPEN_AI_BUILD_HEADERS, apiKey);

    if (typeof config?.assistant === OBJECT) {
      const {function_handler, files_tool_type} = deepChat.directConnection?.azure?.openAI?.assistant as OpenAIAssistant;
      if (function_handler) this._functionHandlerI = function_handler;
      if (files_tool_type) this.filesToolType = files_tool_type;
    }
    if (!AZURE_OPEN_AI_VALIDATE_URL_DETAILS(urlDetails)) {
      this.isTextInputDisabled = true;
      this.canSendMessage = () => false;
      setTimeout(() => {
        deepChat.addMessage({[ERROR]: AZURE_OPEN_AI_URL_DETAILS_ERROR});
      });
    } else {
      this.connectSettings.headers ??= {};
    }
  }
}
