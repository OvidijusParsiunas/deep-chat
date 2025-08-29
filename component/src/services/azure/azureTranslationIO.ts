import {AzureTranslationResult} from '../../types/azureResult';
import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {DirectServiceIO} from '../utils/directServiceIO';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {AzureUtils} from './utils/azureUtils';
import {Response} from '../../types/response';
import {DeepChat} from '../../deepChat';
import {Azure} from '../../types/azure';

export class AzureTranslationIO extends DirectServiceIO {
  override insertKeyPlaceholderText = 'Azure Translate Subscription Key';
  override keyHelpUrl =
    // eslint-disable-next-line max-len
    'https://learn.microsoft.com/en-us/azure/api-management/api-management-subscriptions#create-and-manage-subscriptions-in-azure-portal';
  url = '';

  // prettier-ignore
  constructor(deepChat: DeepChat) {
    const config = deepChat.directConnection?.azure?.translation as NonNullable<Azure['translation']>;
    const apiKey = deepChat.directConnection?.azure;
    super(
      deepChat,
      AzureUtils.buildTranslationKeyVerificationDetails(config.region),
      AzureUtils.buildTranslationHeaders.bind({}, config?.region), apiKey);
    this.url = `https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=${config.language || 'es'}`;
  }

  preprocessBody(messages: MessageContentI[]) {
    const mostRecentMessageText = messages[messages.length - 1].text;
    if (!mostRecentMessageText) return;
    return [{Text: mostRecentMessageText}];
  }

  override async callServiceAPI(messages: Messages, pMessages: MessageContentI[]) {
    if (!this.connectSettings) throw new Error('Request settings have not been set up');
    const body = this.preprocessBody(pMessages);
    HTTPRequest.request(this, body as unknown as object, messages);
  }

  override async extractResultData(result: AzureTranslationResult): Promise<Response> {
    if (Array.isArray(result)) {
      return {text: result[0].translations?.[0].text || ''};
    }
    throw result.error;
  }
}
