import {ValidateMessageBeforeSending} from '../../types/validateMessageBeforeSending';
import {CompletionsHandlers, KeyVerificationHandlers, ServiceIO} from '../serviceIO';
import {RequestInterceptor, ResponseInterceptor} from '../../types/interceptors';
import {RequestSettings, ServiceCallConfig} from '../../types/requestSettings';
import {HuggingFaceResult} from '../../types/huggingFaceResult';
import {Messages} from '../../views/chat/messages/messages';
import {HuggingFaceConfig} from '../../types/huggingFace';
import {HuggingFaceUtils} from './utils/huggingFaceUtils';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {MessageContent} from '../../types/messages';
import {AiAssistant} from '../../aiAssistant';
import {Result} from '../../types/result';

export class HuggingFaceTextGenerationIO implements ServiceIO {
  private static readonly DEFAULT_MODEL = 'gpt2';

  introPanelMarkUp = `
  <div style="width: 100%; text-align: center; margin-left: -10px"><b>Hugging Face</b></div>
  <p>The first call may take around 20 seconds to complete as the model needs to be initialized.`;

  url = `https://api-inference.huggingface.co/models/${HuggingFaceTextGenerationIO.DEFAULT_MODEL}`;

  canSendMessage: ValidateMessageBeforeSending = HuggingFaceTextGenerationIO.canSendMessage;
  private readonly _raw_body: HuggingFaceConfig = {};
  requestSettings?: RequestSettings;
  requestInterceptor: RequestInterceptor = (details) => details;
  resposeInterceptor: ResponseInterceptor = (result) => result;

  constructor(aiAssistant: AiAssistant, key?: string) {
    const {huggingFace, validateMessageBeforeSending} = aiAssistant;
    const config = huggingFace?.textGeneration;
    if (typeof config === 'object') {
      // Completions with no max_tokens behave weirdly and do not give full responses
      // Client should specify their own max_tokens.
      this.requestSettings = key ? HuggingFaceUtils.buildRequestSettings(key, config.request) : config.request;
      if (config.requestInterceptor) this.requestInterceptor = config.requestInterceptor;
      if (config.responseInterceptor) this.resposeInterceptor = config.responseInterceptor;
      if (config.model) this.url = `https://api-inference.huggingface.co/models/${config.model}`;
    }
    const requestSettings = typeof config === 'object' ? config.request : undefined;
    if (key) this.requestSettings = key ? HuggingFaceUtils.buildRequestSettings(key, requestSettings) : requestSettings;
    if (typeof config === 'object') this.cleanConfig(config);
    if (validateMessageBeforeSending) this.canSendMessage = validateMessageBeforeSending;
  }

  private cleanConfig(config: HuggingFaceConfig & ServiceCallConfig) {
    delete config.model;
    delete config.request;
    delete config.requestInterceptor;
    delete config.responseInterceptor;
  }

  private static canSendMessage(text: string) {
    return text.trim() !== '';
  }

  private addKey(onSuccess: (key: string) => void, key: string) {
    this.requestSettings = HuggingFaceUtils.buildRequestSettings(key, this.requestSettings);
    onSuccess(key);
  }

  // prettier-ignore
  verifyKey(inputElement: HTMLInputElement, keyVerificationHandlers: KeyVerificationHandlers) {
    HuggingFaceUtils.verifyKey(inputElement, this.addKey.bind(this, keyVerificationHandlers.onSuccess),
      keyVerificationHandlers.onFail, keyVerificationHandlers.onLoad);
  }

  private preprocessBody(body: HuggingFaceConfig, messages: MessageContent[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body));
    const mostRecentMessageText = messages[messages.length - 1].text;
    if (!mostRecentMessageText) return;
    return {inputs: mostRecentMessageText};
  }

  callApi(messages: Messages, completionsHandlers: CompletionsHandlers) {
    if (!this.requestSettings) throw new Error('Request settings have not been set up');
    const body = this.preprocessBody(this._raw_body, messages.messages) as object;
    HTTPRequest.request(this, body, messages, completionsHandlers.onFinish);
  }

  async extractResultData(result: HuggingFaceResult): Promise<Result> {
    if (result.error) throw result.error;
    return {text: result[0].generated_text || ''};
  }
}
