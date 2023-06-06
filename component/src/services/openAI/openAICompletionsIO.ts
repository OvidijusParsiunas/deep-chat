import {OpenAIConverseBodyInternal} from '../../types/openAIInternal';
import {OpenAIConverseBaseBody} from './utils/openAIConverseBaseBody';
import {CompletionsHandlers, StreamHandlers} from '../serviceIO';
import {OpenAIConverseResult} from '../../types/openAIResult';
import {ExistingServiceIO} from '../utils/existingServiceIO';
import {Messages} from '../../views/chat/messages/messages';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {MessageContent} from '../../types/messages';
import {OpenAIUtils} from './utils/openAIUtils';
import {AiAssistant} from '../../aiAssistant';
import {OpenAI} from '../../types/openAI';
import {Result} from '../../types/result';

export class OpenAICompletionsIO extends ExistingServiceIO {
  override insertKeyPlaceholderText = 'OpenAI API Key';
  override getKeyLink = 'https://platform.openai.com/account/api-keys';
  url = 'https://api.openai.com/v1/completions';
  private readonly _maxCharLength: number = OpenAIUtils.CONVERSE_MAX_CHAR_LENGTH;
  // text-davinci-003 total max limit is 4097 - keeping it at 4000 just to be safe
  private readonly full_transaction_max_tokens = 4000;
  // it is recommended to consider that just under 4 chars are in a token - https://platform.openai.com/tokenizer
  private readonly numberOfCharsPerToken = 3.5;

  constructor(aiAssistant: AiAssistant) {
    const {service, textInput} = aiAssistant;
    const config = service?.openAI?.completions as NonNullable<OpenAI['completions']>;
    super(aiAssistant, OpenAIUtils.buildKeyVerificationDetails(), OpenAIUtils.buildHeaders, config);
    // Completions with no max_tokens behave weirdly and do not give full responses
    // Client should specify their own max_tokens.
    if (textInput?.characterLimit) this._maxCharLength = textInput.characterLimit;
    if (typeof config === 'object') Object.assign(this.rawBody, config);
    this.rawBody.model ??= OpenAIConverseBaseBody.GPT_COMPLETIONS_DAVINCI_MODEL;
  }

  // prettier-ignore
  private preprocessBody(body: OpenAIConverseBodyInternal, messages: MessageContent[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body));
    const mostRecentMessageText = messages[messages.length - 1].text;
    if (!mostRecentMessageText) return;
    const processedMessage = mostRecentMessageText.substring(0, this._maxCharLength);
    const maxTokens = bodyCopy.max_tokens
      || this.full_transaction_max_tokens - processedMessage.length / this.numberOfCharsPerToken;
    const maxTokensInt = Math.floor(maxTokens);
    return {prompt: processedMessage, max_tokens: maxTokensInt, ...bodyCopy};
  }

  // prettier-ignore
  override callServiceAPI(messages: Messages, pMessages: MessageContent[],
      completionsHandlers: CompletionsHandlers, streamHandlers: StreamHandlers) {
    if (!this.requestSettings) throw new Error('Request settings have not been set up');
    const body = this.preprocessBody(this.rawBody, pMessages);
    if (this._isStream || body.stream) {
      body.stream = true;
      HTTPRequest.requestStream(this, body, messages,
        streamHandlers.onOpen, streamHandlers.onClose, streamHandlers.abortStream);
    } else {
      HTTPRequest.request(this, body, messages, completionsHandlers.onFinish);
    }
  }

  override async extractResultData(result: OpenAIConverseResult): Promise<Result> {
    if (result.error) throw result.error.message;
    return {text: result.choices[0]?.text || ''};
  }
}
