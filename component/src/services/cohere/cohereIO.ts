import {CohereGenerateConfig, CohereSummarizationConfig} from '../../types/cohere';
import {Messages} from '../../views/chat/messages/messages';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {InterfacesUnion} from '../../types/utilityTypes';
import {BaseServideIO} from '../utils/baseServiceIO';
import {MessageContent} from '../../types/messages';
import {CompletionsHandlers} from '../serviceIO';
import {GenericObject} from '../../types/object';
import {CohereUtils} from './utils/cohereUtils';
import {AiAssistant} from '../../aiAssistant';

type Body = InterfacesUnion<CohereGenerateConfig | CohereSummarizationConfig>;

type CohereServiceConfig = true | GenericObject<string>;

export class CohereIO extends BaseServideIO {
  override insertKeyPlaceholderText = 'Cohere API Key';
  override getKeyLink = 'https://dashboard.cohere.ai/api-keys';
  textInputPlaceholderText: string;
  url: string;
  private readonly _raw_body: Body = {};

  constructor(aiAssistant: AiAssistant, url: string, inputPlaceholder: string, config?: CohereServiceConfig) {
    super(aiAssistant, CohereUtils.buildKeyVerificationDetails(), CohereUtils.buildHeaders, config);
    this.url = url;
    this.textInputPlaceholderText = inputPlaceholder;
    if (config && typeof config === 'object') Object.assign(this._raw_body, config);
  }

  preprocessBody(body: Body, messages: MessageContent[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body));
    const mostRecentMessageText = messages[messages.length - 1].text;
    if (!mostRecentMessageText) return;
    return {prompt: mostRecentMessageText, ...bodyCopy};
  }

  override callApi(messages: Messages, completionsHandlers: CompletionsHandlers) {
    if (!this.requestSettings) throw new Error('Request settings have not been set up');
    const body = this.preprocessBody(this._raw_body, messages.messages);
    HTTPRequest.request(this, body, messages, completionsHandlers.onFinish);
  }
}
