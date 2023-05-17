import {CompletionsHandlers, StreamHandlers} from '../serviceIO';
import {ServiceCallConfig} from '../../types/requestSettings';
import {Messages} from '../../views/chat/messages/messages';
import {HuggingFaceUtils} from './utils/huggingFaceUtils';
import {HuggingFaceModel} from '../../types/huggingFace';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {BaseServideIO} from '../utils/baseServiceIO';
import {MessageContent} from '../../types/messages';
import {FILE_TYPES} from '../../types/fileTypes';
import {AiAssistant} from '../../aiAssistant';

type HuggingFaceServiceConfigObj = {parameters?: object; options?: object; context?: string};

type HuggingFaceServiceConfig = true | (HuggingFaceModel & HuggingFaceServiceConfigObj & ServiceCallConfig);

export class HuggingFaceIO<T extends HuggingFaceServiceConfigObj = {}> extends BaseServideIO {
  override insertKeyPlaceholderText = 'Hugging Face Access Token';
  override getKeyLink = 'https://huggingface.co/settings/tokens';
  private static readonly URL_PREFIX = 'https://api-inference.huggingface.co/models/';
  introPanelMarkUp = `
    <div style="width: 100%; text-align: center; margin-left: -10px"><b>Hugging Face</b></div>
    <p>First message may take an extented amount of time to complete as the model needs to be initialized.</p>`;

  url: string;
  textInputPlaceholderText: string;
  private readonly _raw_body: T = {} as T;

  // prettier-ignore
  constructor(aiAssistant: AiAssistant, textInputPlaceholderText: string, defaultModel: string,
      config?: HuggingFaceServiceConfig, fileType?: FILE_TYPES) {
    super(
      aiAssistant, HuggingFaceUtils.buildKeyVerificationDetails(), HuggingFaceUtils.buildHeaders, config, fileType);
    this.url = `${HuggingFaceIO.URL_PREFIX}${defaultModel}`;
    this.textInputPlaceholderText = textInputPlaceholderText;
    // don't bother cleaning the config as we construct _raw_body with individual props
    if (typeof config === 'object') {
      if (config.model) this.url = `${HuggingFaceIO.URL_PREFIX}${config.model}`;
      if (config.options) this._raw_body.options = config.options;
      if (config.parameters) this._raw_body.parameters = config.parameters;
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

  override callApi(messages: Messages, completionsHandlers: CompletionsHandlers, _: StreamHandlers, files?: File[]) {
    if (!this.requestSettings) throw new Error('Request settings have not been set up');
    const body = this.preprocessBody(this._raw_body, messages.messages, files) as object;
    HTTPRequest.request(this, body, messages, completionsHandlers.onFinish);
  }
}
