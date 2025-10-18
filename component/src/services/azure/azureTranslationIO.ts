import {AZURE_BUILD_TRANSLATION_KEY_VERIFICATION_DETAILS, AZURE_BUILD_TRANSLATION_HEADERS} from './utils/azureUtils';
import {ERROR, TEXT} from '../../utils/consts/messageConstants';
import {AzureTranslationResult} from '../../types/azureResult';
import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {DirectServiceIO} from '../utils/directServiceIO';
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
      AZURE_BUILD_TRANSLATION_KEY_VERIFICATION_DETAILS(config.region),
      AZURE_BUILD_TRANSLATION_HEADERS.bind({}, config?.region), apiKey);
    this.url = `https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=${config.language || 'es'}`;
  }

  preprocessBody(messages: MessageContentI[]) {
    const mostRecentMessageText = messages[messages.length - 1][TEXT];
    if (!mostRecentMessageText) return;
    return [{Text: mostRecentMessageText}];
  }

  override async callServiceAPI(messages: Messages, pMessages: MessageContentI[]) {
    this.callDirectServiceServiceAPI(messages, pMessages, this.preprocessBody.bind(this));
  }

  override async extractResultData(result: AzureTranslationResult): Promise<Response> {
    if (Array.isArray(result)) {
      return {[TEXT]: result[0].translations?.[0][TEXT] || ''};
    }
    throw result[ERROR];
  }
}
