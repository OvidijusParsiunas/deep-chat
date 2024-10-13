import {DirectConnection} from '../../types/directConnection';
import {AzureOpenAIUtils} from './utils/azureOpenAIUtils';
import {OpenAIChatIO} from '../openAI/openAIChatIO';
import {AzureOpenAI} from '../../types/azure';
import {DeepChat} from '../../deepChat';

export class AzureOpenAIChatIO extends OpenAIChatIO {
  constructor(deepChat: DeepChat) {
    const directConnectionCopy = JSON.parse(JSON.stringify(deepChat.directConnection)) as DirectConnection;
    const key = directConnectionCopy.azure;
    const urlDetails = directConnectionCopy.azure?.openAI?.urlDetails as AzureOpenAI['urlDetails'];
    const config = directConnectionCopy.azure?.openAI?.chat as AzureOpenAI['chat'];

    // WORK
    if (!urlDetails) throw Error('Please define the Azure URL Details. More details [here](WORK)');

    super(deepChat, AzureOpenAIUtils.buildKeyVerificationDetails(urlDetails), AzureOpenAIUtils.buildHeaders, key, config);
    this.url = AzureOpenAIChatIO.buildURL(urlDetails);
  }

  private static buildURL(urlDetails: AzureOpenAI['urlDetails']) {
    const {endpoint, deploymentId, version} = urlDetails;
    return `${endpoint}/openai/deployments/${deploymentId}/completions?api-version=${version}`;
  }
}
