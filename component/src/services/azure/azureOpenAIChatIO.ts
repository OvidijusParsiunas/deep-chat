import {AzureOpenAI, AzureOpenAIChat} from '../../types/azure';
import {DirectConnection} from '../../types/directConnection';
import {ERROR} from '../../utils/consts/messageConstants';
import {OpenAIChatIO} from '../openAI/openAIChatIO';
import {OBJECT} from '../utils/serviceConstants';
import {DeepChat} from '../../deepChat';
import {
  AZURE_OPEN_AI_BUILD_KEY_VERIFICATION_DETAILS,
  AZURE_OPEN_AI_VALIDATE_URL_DETAILS,
  AZURE_OPEN_AI_BUILD_HEADERS,
  AZURE_OPEN_AI_URL_DETAILS_ERROR,
} from './utils/azureOpenAIUtils';

export class AzureOpenAIChatIO extends OpenAIChatIO {
  override permittedErrorPrefixes: string[] = [AZURE_OPEN_AI_URL_DETAILS_ERROR];
  isTextInputDisabled = false;

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = JSON.parse(JSON.stringify(deepChat.directConnection)) as DirectConnection;
    const key = directConnectionCopy.azure;
    const urlDetails = directConnectionCopy.azure?.openAI?.urlDetails || ({} as AzureOpenAI['urlDetails']);
    const config = directConnectionCopy.azure?.openAI?.chat as AzureOpenAI['chat'];

    super(deepChat, AZURE_OPEN_AI_BUILD_KEY_VERIFICATION_DETAILS(urlDetails), AZURE_OPEN_AI_BUILD_HEADERS, key, config);

    if (typeof config === OBJECT) {
      const {function_handler} = deepChat.directConnection?.azure?.openAI?.chat as AzureOpenAIChat;
      if (function_handler) this.functionHandler = function_handler;
    }
    if (!AZURE_OPEN_AI_VALIDATE_URL_DETAILS(urlDetails)) {
      this.isTextInputDisabled = true;
      this.canSendMessage = () => false;
      setTimeout(() => {
        deepChat.addMessage({[ERROR]: AZURE_OPEN_AI_URL_DETAILS_ERROR});
      });
    } else {
      this.url = AzureOpenAIChatIO.buildURL(urlDetails);
    }
  }

  private static buildURL(urlDetails: AzureOpenAI['urlDetails']) {
    const {endpoint, deploymentId, version} = urlDetails;
    return `${endpoint}/openai/deployments/${deploymentId}/chat/completions?api-version=${version}`;
  }
}
