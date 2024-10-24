import {OpenAIAssistantIOI} from '../openAI/assistant/openAIAssistantIOI';
import {DirectConnection} from '../../types/directConnection';
import {AzureOpenAIUtils} from './utils/azureOpenAIUtils';
import {AzureOpenAI} from '../../types/azure';
import {DeepChat} from '../../deepChat';

export class AzureOpenAIAssistantIO extends OpenAIAssistantIOI {
  private static readonly THREAD_RESOURCE = `threads`;
  private static readonly NEW_ASSISTANT_RESOURCE = 'assistants';
  override permittedErrorPrefixes: string[] = [AzureOpenAIUtils.URL_DETAILS_ERROR_MESSAGE];
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
      createMessagePostfix: `?order=desc&api-version=${config?.urlDetails?.version}`,
      listMessagesPostfix: commonPostfix,
      storeFiles: `${commonPrefix}files${commonPostfix}`,
      getFilesPrefix: `${commonPrefix}files/`,
      getFilesPostfix: `/content${commonPostfix}`,
    };

    super(deepChat, config?.assistant, urlSegments, apiKey);

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
