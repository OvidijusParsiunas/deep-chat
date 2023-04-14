import {CompletionsHandlers, KeyVerificationHandlers, ServiceIO} from '../serviceIO';
import {RequestInterceptor} from '../../types/requestInterceptor';
import {OpenAI, OpenAIImagesConfig} from '../../types/openAI';
import {Messages} from '../../views/chat/messages/messages';
import {RequestSettings} from '../../types/requestSettings';
import {OpenAIImageResult} from '../../types/openAIResult';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {ImageResults} from '../../types/imageResult';
import {MessageContent} from '../../types/messages';
import {OpenAIUtils} from './utils/openAIUtils';
import {AiAssistant} from '../../aiAssistant';

export class OpenAIImagesIO implements ServiceIO<OpenAIImagesConfig, OpenAIImageResult> {
  url = 'https://api.openai.com/v1/images/generations';
  private readonly _maxCharLength: number = OpenAIUtils.IMAGES_MAX_CHAR_LENGTH;
  requestSettings?: RequestSettings;
  body: OpenAIImagesConfig = {};
  private readonly _requestInterceptor: RequestInterceptor;

  constructor(aiAssistant: AiAssistant, key?: string) {
    const {openAI, requestInterceptor, requestSettings, inputCharacterLimit} = aiAssistant;
    if (inputCharacterLimit) this._maxCharLength = inputCharacterLimit;
    this.requestSettings = key ? OpenAIUtils.buildRequestSettings(key, requestSettings) : requestSettings;
    this._requestInterceptor = requestInterceptor || ((body) => body);
    const config = openAI?.completions as OpenAI['images'];
    if (config && typeof config !== 'boolean') this.body = config;
  }

  private addKey(onSuccess: (key: string) => void, key: string) {
    this.requestSettings = OpenAIUtils.buildRequestSettings(key, this.requestSettings);
    onSuccess(key);
  }

  // prettier-ignore
  verifyKey(inputElement: HTMLInputElement, keyVerificationHandlers: KeyVerificationHandlers) {
    OpenAIUtils.verifyKey(inputElement, this.addKey.bind(this, keyVerificationHandlers.onSuccess),
      keyVerificationHandlers.onFail, keyVerificationHandlers.onLoad);
  }

  preprocessBody(body: OpenAIImagesConfig, messages: MessageContent[]) {
    const mostRecentMessageText = messages[messages.length - 1].content;
    const processedMessage = mostRecentMessageText.substring(0, this._maxCharLength);
    return {prompt: processedMessage, ...body};
  }

  callApi(messages: Messages, completionsHandlers: CompletionsHandlers) {
    if (!this.requestSettings) throw new Error('Request settings have not been set up');
    HTTPRequest.request(this, this.body, messages, this._requestInterceptor, completionsHandlers.onFinish);
  }

  extractResultData(result: OpenAIImageResult): ImageResults {
    if (result.error) throw result.error.message;
    return result.data.map((imageData) => {
      if (imageData.url) return imageData;
      return {base64: `data:image/png;base64,${imageData.b64_json}`};
    }) as ImageResults;
  }
}
