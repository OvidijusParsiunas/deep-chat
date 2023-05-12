import {CohereGenerateConfig, CohereSummarizationConfig} from '../../types/cohere';
import {ServiceCallConfig} from '../../types/requestSettings';
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

type CohereServiceConfig = true | (GenericObject<string> & ServiceCallConfig);

export class CohereIO extends BaseServideIO {
  placeholderText: string;
  url: string;
  private readonly _raw_body: Body = {};

  constructor(aiAssistant: AiAssistant, url: string, placeholderText: string, config?: CohereServiceConfig, key?: string) {
    super(aiAssistant, CohereUtils.buildKeyVerificationDetails(), CohereUtils.buildHeaders, config, key);
    this.url = url;
    this.placeholderText = placeholderText;
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
