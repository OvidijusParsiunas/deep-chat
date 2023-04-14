import {CompletionsHandlers, KeyVerificationHandlers, ServiceIO, StreamHandlers} from '../serviceIO';
import {OpenAI, OpenAICustomCompletionLimits} from '../../types/openAI';
import {OpenAIConverseBodyInternal} from '../../types/openAIInternal';
import {OpenAIConverseBaseBody} from './utils/openAIConverseBaseBody';
import {RequestInterceptor} from '../../types/requestInterceptor';
import {OpenAIConverseResult} from '../../types/openAIResult';
import {Messages} from '../../views/chat/messages/messages';
import {RequestSettings} from '../../types/requestSettings';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {MessageContent} from '../../types/messages';
import {OpenAIUtils} from './utils/openAIUtils';
import {AiAssistant} from '../../aiAssistant';

export class OpenAICompletionsIO implements ServiceIO {
  url = 'https://api.openai.com/v1/completions';
  private readonly _maxCharLength: number = OpenAIUtils.CONVERSE_MAX_CHAR_LENGTH;
  // text-davinci-003 total max limit is 4097 - keeping it at 4000 just to be safe
  private readonly full_transaction_max_tokens = 4000;
  // it is recommended to consider that just under 4 chars are in a token - https://platform.openai.com/tokenizer
  private readonly numberOfCharsPerToken = 3.5;
  requestSettings?: RequestSettings;
  private readonly _raw_body: OpenAIConverseBodyInternal;
  private readonly _requestInterceptor: RequestInterceptor;

  constructor(aiAssistant: AiAssistant, key?: string) {
    const {openAI, requestInterceptor, requestSettings, inputCharacterLimit} = aiAssistant;
    const config = openAI?.completions as OpenAI['completions'];
    if (config && typeof config !== 'boolean') {
      // Completions with no max_tokens behave weirdly and do not give full responses
      // Client should specify their own max_tokens.
      const newMaxCharLength = config.max_char_length || inputCharacterLimit;
      if (newMaxCharLength) this._maxCharLength = newMaxCharLength;
      this.cleanConfig(config);
    }
    this.requestSettings = key ? OpenAIUtils.buildRequestSettings(key, requestSettings) : requestSettings;
    this._requestInterceptor = requestInterceptor || ((body) => body);
    this._raw_body = OpenAIConverseBaseBody.build(OpenAIConverseBaseBody.GPT_COMPLETIONS_DAVINCI_MODEL, config);
  }

  private cleanConfig(config: OpenAICustomCompletionLimits) {
    delete config.max_char_length;
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

  // prettier-ignore
  private preprocessBody(body: OpenAIConverseBodyInternal, messages: MessageContent[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body));
    const mostRecentMessageText = messages[messages.length - 1].content;
    const processedMessage = mostRecentMessageText.substring(0, this._maxCharLength);
    const maxTokens = bodyCopy.max_tokens
      || this.full_transaction_max_tokens - processedMessage.length / this.numberOfCharsPerToken;
    const maxTokensInt = Math.floor(maxTokens);
    return {prompt: processedMessage, max_tokens: maxTokensInt, ...bodyCopy};
  }

  // prettier-ignore
  callApi(messages: Messages, completionsHandlers: CompletionsHandlers, streamHandlers: StreamHandlers) {
    if (!this.requestSettings) throw new Error('Request settings have not been set up');
    const body = this.preprocessBody(this._raw_body, messages.messages);
    if (body.stream) {
      HTTPRequest.requestStream(this, body, messages, this._requestInterceptor,
        streamHandlers.onOpen, streamHandlers.onClose, streamHandlers.abortStream);
    } else {
      HTTPRequest.request(this, body, messages, this._requestInterceptor, completionsHandlers.onFinish);
    }
  }

  extractResultData(result: OpenAIConverseResult): string {
    if (result.error) throw result.error.message;
    return result.choices[0]?.text || '';
  }
}
