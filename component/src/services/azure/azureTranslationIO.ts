import {AzureTranslationResult} from '../../types/azureResult';
import {Messages} from '../../views/chat/messages/messages';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {BaseServideIO} from '../utils/baseServiceIO';
import {MessageContent} from '../../types/messages';
import {CompletionsHandlers} from '../serviceIO';
import {AiAssistant} from '../../aiAssistant';
import {AzureUtils} from './utils/azureUtils';
import {Result} from '../../types/result';
import {Azure} from '../../types/azure';

export class AzureTranslationIO extends BaseServideIO {
  override insertKeyPlaceholderText = 'Azure Translate Subscription Key';
  override getKeyLink =
    // eslint-disable-next-line max-len
    'https://learn.microsoft.com/en-us/azure/api-management/api-management-subscriptions#create-and-manage-subscriptions-in-azure-portal';
  url = '';

  // prettier-ignore
  constructor(aiAssistant: AiAssistant, key?: string) {
    const {service} = aiAssistant;
    const config = service?.azure?.translation as NonNullable<Azure['translation']>;
    super(
      aiAssistant,
      AzureUtils.buildTranslationKeyVerificationDetails(config.region as string),
      AzureUtils.buildTranslationHeaders.bind({}, config?.region),
      config, key);
    this.url = `https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=${config.language || 'es'}`;
  }

  preprocessBody(messages: MessageContent[]) {
    const mostRecentMessageText = messages[messages.length - 1].text;
    if (!mostRecentMessageText) return;
    return [{Text: mostRecentMessageText}];
  }

  override callApi(messages: Messages, completionsHandlers: CompletionsHandlers) {
    if (!this.requestSettings) throw new Error('Request settings have not been set up');
    const body = this.preprocessBody(messages.messages);
    HTTPRequest.request(this, body as unknown as object, messages, completionsHandlers.onFinish);
  }

  async extractResultData(result: AzureTranslationResult): Promise<Result> {
    if (Array.isArray(result)) {
      return {text: result[0].translations?.[0].text || ''};
    }
    if (result.error) throw result.error;
    return {text: ''};
  }
}
