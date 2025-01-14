import {OllamaOpenAIUtils} from './utils/ollamaOpenAIUtils';
import {OpenAIChatIO} from '../openAI/openAIChatIO';
import {DirectConnection} from '../../types/directConnection';
import {OllamaOpenAI, URLDetails} from '../../types/ollama';
import {OpenAIChat} from '../../types/openAI';
import {DeepChat} from '../../deepChat';

export class OllamaOpenAIChatIO extends OpenAIChatIO {
  override permittedErrorPrefixes: string[] = [OllamaOpenAIUtils.URL_DETAILS_ERROR_MESSAGE];
  isTextInputDisabled = false;

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = JSON.parse(JSON.stringify(deepChat.directConnection)) as DirectConnection;
    const urlDetails = directConnectionCopy.ollama?.openAI?.urlDetails || ({
      endpoint: 'http://localhost:11434/v1',
    } as URLDetails);
    const config = directConnectionCopy.ollama?.openAI?.chat as OllamaOpenAI['chat'];

    super(
      deepChat,
      OllamaOpenAIUtils.buildKeyVerificationDetails(urlDetails),
      OllamaOpenAIUtils.buildHeaders,
      {
        key: 'ollama',
        validateKeyProperty: false,
      },
      config,
    );

    if (typeof config === 'object') {
      const {function_handler} = deepChat.directConnection?.ollama?.openAI?.chat as OpenAIChat;
      if (function_handler) this._functionHandler = function_handler;
    }
    if (!OllamaOpenAIUtils.validateURLDetails(urlDetails)) {
      this.isTextInputDisabled = true;
      this.canSendMessage = () => false;
      setTimeout(() => {
        deepChat.addMessage({error: OllamaOpenAIUtils.URL_DETAILS_ERROR_MESSAGE});
      });
    } else {
      this.url = OllamaOpenAIChatIO.buildURL(urlDetails);
    }
  }

  private static buildURL(urlDetails: URLDetails) {
    return `${urlDetails.endpoint}/chat/completions`;
  }
}
