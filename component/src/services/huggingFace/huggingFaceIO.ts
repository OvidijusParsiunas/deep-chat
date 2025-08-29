import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {HuggingFaceUtils} from './utils/huggingFaceUtils';
import {DirectServiceIO} from '../utils/directServiceIO';
import {HuggingFaceModel} from '../../types/huggingFace';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {ServiceFileTypes} from '../serviceIO';
import {APIKey} from '../../types/APIKey';
import {DeepChat} from '../../deepChat';

type HuggingFaceServiceConfigObj = {parameters?: object; options?: object; context?: string};

type HuggingFaceServiceConfig = true | (HuggingFaceModel & HuggingFaceServiceConfigObj);

export class HuggingFaceIO extends DirectServiceIO {
  override insertKeyPlaceholderText = 'Hugging Face Token';
  override keyHelpUrl = 'https://huggingface.co/settings/tokens';
  private static readonly URL_PREFIX = 'https://api-inference.huggingface.co/models/';
  introPanelMarkUp = `
    <div style="width: 100%; text-align: center; margin-left: -10px"><b>Hugging Face</b></div>
    <p>First message may take an extented amount of time to complete as the model needs to be initialized.</p>`;
  permittedErrorPrefixes = ['Authorization header'];
  url: string;
  textInputPlaceholderText: string;

  // prettier-ignore
  constructor(deepChat: DeepChat, textInputPlaceholderText: string, defaultModel: string,
      config?: HuggingFaceServiceConfig, apiKey?: APIKey, existingFileTypes?: ServiceFileTypes) {
    super(deepChat,
      HuggingFaceUtils.buildKeyVerificationDetails(), HuggingFaceUtils.buildHeaders, apiKey, existingFileTypes);
    this.url = `${HuggingFaceIO.URL_PREFIX}${defaultModel}`;
    this.textInputPlaceholderText = textInputPlaceholderText;
    // don't bother cleaning the config as we construct rawBody with individual props
    if (typeof config === 'object') {
      if (config.model) this.url = `${HuggingFaceIO.URL_PREFIX}${config.model}`;
      if (config.options) this.rawBody.options = config.options;
      if (config.parameters) this.rawBody.parameters = config.parameters;
    }
  }

  // prettier-ignore
  preprocessBody(body: HuggingFaceServiceConfigObj, messages: MessageContentI[], _?: File[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body)) as (HuggingFaceServiceConfigObj
      & {options?: {wait_for_model?: boolean}});
    const mostRecentMessageText = messages[messages.length - 1].text;
    if (!mostRecentMessageText) return;
    bodyCopy.options ??= {};
    bodyCopy.options.wait_for_model = true;
    return {inputs: mostRecentMessageText, ...bodyCopy};
  }

  override async callServiceAPI(messages: Messages, pMessages: MessageContentI[], files?: File[]) {
    if (!this.connectSettings) throw new Error('Request settings have not been set up');
    const body = this.preprocessBody(this.rawBody, pMessages, files) as object;
    HTTPRequest.request(this, body, messages);
  }
}
