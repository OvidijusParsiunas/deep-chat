import {CohereGenerateConfig, CohereSummarizationConfig} from '../../types/cohere';
import {Messages} from '../../views/chat/messages/messages';
import {DirectServiceIO} from '../utils/directServiceIO';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {InterfacesUnion} from '../../types/utilityTypes';
import {MessageContent} from '../../types/messages';
import {CompletionsHandlers} from '../serviceIO';
import {GenericObject} from '../../types/object';
import {CohereUtils} from './utils/cohereUtils';
import {APIKey} from '../../types/APIKey';
import {DeepChat} from '../../deepChat';

type CohereServiceConfig = true | GenericObject<string>;

export class CohereIO extends DirectServiceIO {
  override insertKeyPlaceholderText = 'Cohere API Key';
  override getKeyLink = 'https://dashboard.cohere.ai/api-keys';
  textInputPlaceholderText: string;
  permittedErrorPrefixes = ['invalid request'];
  url: string;

  constructor(deepChat: DeepChat, url: string, inputPlaceholder: string, config?: CohereServiceConfig, apiKey?: APIKey) {
    super(deepChat, CohereUtils.buildKeyVerificationDetails(), CohereUtils.buildHeaders, apiKey);
    this.url = url;
    this.textInputPlaceholderText = inputPlaceholder;
    if (config && typeof config === 'object') Object.assign(this.rawBody, config);
  }

  preprocessBody(body: InterfacesUnion<CohereGenerateConfig | CohereSummarizationConfig>, messages: MessageContent[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body));
    const mostRecentMessageText = messages[messages.length - 1].text;
    if (!mostRecentMessageText) return;
    return {prompt: mostRecentMessageText, ...bodyCopy};
  }

  override callServiceAPI(messages: Messages, pMessages: MessageContent[], completionsHandlers: CompletionsHandlers) {
    if (!this.requestSettings) throw new Error('Request settings have not been set up');
    const body = this.preprocessBody(this.rawBody, pMessages);
    HTTPRequest.request(this, body, messages, completionsHandlers.onFinish);
  }
}
