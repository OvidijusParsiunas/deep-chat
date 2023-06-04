import {CompletionsHandlers, ServiceFileTypes, StreamHandlers} from '../serviceIO';
import {Messages} from '../../views/chat/messages/messages';
import {HuggingFaceUtils} from './utils/huggingFaceUtils';
import {HuggingFaceModel} from '../../types/huggingFace';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {BaseServideIO} from '../utils/baseServiceIO';
import {MessageContent} from '../../types/messages';
import {AiAssistant} from '../../aiAssistant';
import {APIKey} from '../../types/APIKey';

type HuggingFaceServiceConfigObj = {parameters?: object; options?: object; context?: string};

type HuggingFaceServiceConfig = true | (APIKey & HuggingFaceModel & HuggingFaceServiceConfigObj);

export class HuggingFaceIO<T extends HuggingFaceServiceConfigObj = {}> extends BaseServideIO {
  override insertKeyPlaceholderText = 'Hugging Face Access Token';
  override getKeyLink = 'https://huggingface.co/settings/tokens';
  private static readonly URL_PREFIX = 'https://api-inference.huggingface.co/models/';
  introPanelMarkUp = `
    <div style="width: 100%; text-align: center; margin-left: -10px"><b>Hugging Face</b></div>
    <p>First message may take an extented amount of time to complete as the model needs to be initialized.</p>`;

  url: string;
  textInputPlaceholderText: string;
  override readonly raw_body: T = {} as T;

  // prettier-ignore
  constructor(aiAssistant: AiAssistant, textInputPlaceholderText: string, defaultModel: string,
      config?: HuggingFaceServiceConfig, defaultFileTypes?: ServiceFileTypes) {
    super(aiAssistant,
      HuggingFaceUtils.buildKeyVerificationDetails(), HuggingFaceUtils.buildHeaders, config, defaultFileTypes);
    this.url = `${HuggingFaceIO.URL_PREFIX}${defaultModel}`;
    this.textInputPlaceholderText = textInputPlaceholderText;
    // don't bother cleaning the config as we construct raw_body with individual props
    if (typeof config === 'object') {
      if (config.model) this.url = `${HuggingFaceIO.URL_PREFIX}${config.model}`;
      if (config.options) this.raw_body.options = config.options;
      if (config.parameters) this.raw_body.parameters = config.parameters;
    }
  }

  // prettier-ignore
  preprocessBody(body: HuggingFaceServiceConfigObj, messages: MessageContent[], _?: File[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body)) as (HuggingFaceServiceConfigObj
      & {options?: {wait_for_model?: boolean}});
    const mostRecentMessageText = messages[messages.length - 1].text;
    if (!mostRecentMessageText) return;
    bodyCopy.options ??= {};
    bodyCopy.options.wait_for_model = true;
    return {inputs: mostRecentMessageText, ...bodyCopy};
  }

  // prettier-ignore
  override callServiceAPI(messages: Messages, pMessages: MessageContent[],
      completionsHandlers: CompletionsHandlers, _: StreamHandlers, files?: File[]) {
    if (!this.requestSettings) throw new Error('Request settings have not been set up');
    const body = this.preprocessBody(this.raw_body, pMessages, files) as object;
    HTTPRequest.request(this, body, messages, completionsHandlers.onFinish);
  }
}
