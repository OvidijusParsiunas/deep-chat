import {AzureOpenAI, AzureOpenAIChat} from '../../types/azure';
import {DirectConnection} from '../../types/directConnection';
import {AzureOpenAIUtils} from './utils/azureOpenAIUtils';
import {OpenAIChatIO} from '../openAI/openAIChatIO';
import {DeepChat} from '../../deepChat';

export class AzureOpenAIChatIO extends OpenAIChatIO {
  override permittedErrorPrefixes: string[] = [AzureOpenAIUtils.URL_DETAILS_ERROR_MESSAGE];
  isTextInputDisabled = false;

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = JSON.parse(JSON.stringify(deepChat.directConnection)) as DirectConnection;
    const key = directConnectionCopy.azure;
    const urlDetails = directConnectionCopy.azure?.openAI?.urlDetails || ({} as AzureOpenAI['urlDetails']);
    const config = directConnectionCopy.azure?.openAI?.chat as AzureOpenAI['chat'];

    super(deepChat, AzureOpenAIUtils.buildKeyVerificationDetails(urlDetails), AzureOpenAIUtils.buildHeaders, key, config);

    if (typeof config === 'object') {
      const {function_handler} = deepChat.directConnection?.azure?.openAI?.chat as AzureOpenAIChat;
      if (function_handler) this._functionHandler = function_handler;
    }
    if (!AzureOpenAIUtils.validateURLDetails(urlDetails)) {
      this.isTextInputDisabled = true;
      this.canSendMessage = () => false;
      setTimeout(() => {
        deepChat.addMessage({error: AzureOpenAIUtils.URL_DETAILS_ERROR_MESSAGE});
      });
    } else {
      this.url = AzureOpenAIChatIO.buildURL(urlDetails);
    }
  }

  private static buildURL(urlDetails: AzureOpenAI['urlDetails']) {
    const {endpoint, deploymentId, version} = urlDetails;
    return `${endpoint}/openai/deployments/${deploymentId}/completions?api-version=${version}`;
  }
}
