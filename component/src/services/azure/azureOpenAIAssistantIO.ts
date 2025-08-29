import {OpenAIAssistantIOI} from '../openAI/assistant/openAIAssistantIOI';
import {DirectConnection} from '../../types/directConnection';
import {AzureOpenAIUtils} from './utils/azureOpenAIUtils';
import {OpenAIAssistant} from '../../types/openAI';
import {AzureOpenAI} from '../../types/azure';
import {DeepChat} from '../../deepChat';

export class AzureOpenAIAssistantIO extends OpenAIAssistantIOI {
  private static readonly THREAD_RESOURCE = `threads`;
  private static readonly NEW_ASSISTANT_RESOURCE = 'assistants';
  override permittedErrorPrefixes: string[] = [AzureOpenAIUtils.URL_DETAILS_ERROR_MESSAGE];
  override insertKeyPlaceholderText = 'Azure OpenAI API Key';
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
      storeFiles: `${commonPrefix}files${commonPostfix}`,
      getFilesPrefix: `${commonPrefix}files/`,
      getFilesPostfix: `/content${commonPostfix}`,
    };

    // prettier-ignore
    super(deepChat, config?.assistant, urlSegments,
      AzureOpenAIUtils.buildKeyVerificationDetails(urlDetails), AzureOpenAIUtils.buildHeaders, apiKey);

    if (typeof config?.assistant === 'object') {
      const {function_handler, files_tool_type} = deepChat.directConnection?.azure?.openAI?.assistant as OpenAIAssistant;
      if (function_handler) this.functionHandler = function_handler;
      if (files_tool_type) this.filesToolType = files_tool_type;
    }
    if (!AzureOpenAIUtils.validateURLDetails(urlDetails)) {
      this.isTextInputDisabled = true;
      this.canSendMessage = () => false;
      setTimeout(() => {
        deepChat.addMessage({error: AzureOpenAIUtils.URL_DETAILS_ERROR_MESSAGE});
      });
    } else {
      this.connectSettings.headers ??= {};
    }
  }
}
