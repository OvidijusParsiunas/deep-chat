import {OpenAIConverseBodyInternal} from '../../types/openAIInternal';
import {OpenAIConverseBaseBody} from './utils/openAIConverseBaseBody';
import {CompletionsHandlers, StreamHandlers} from '../serviceIO';
import {OpenAIConverseResult} from '../../types/openAIResult';
import {Messages} from '../../views/chat/messages/messages';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {BaseServideIO} from '../utils/baseServiceIO';
import {MessageContent} from '../../types/messages';
import {OpenAIUtils} from './utils/openAIUtils';
import {AiAssistant} from '../../aiAssistant';
import {OpenAI} from '../../types/openAI';
import {Result} from '../../types/result';

export class OpenAICompletionsIO extends BaseServideIO {
  override insertKeyPlaceholderText = 'OpenAI API Key';
  override getKeyLink = 'https://platform.openai.com/account/api-keys';
  url = 'https://api.openai.com/v1/completions';
  private readonly _maxCharLength: number = OpenAIUtils.CONVERSE_MAX_CHAR_LENGTH;
  // text-davinci-003 total max limit is 4097 - keeping it at 4000 just to be safe
  private readonly full_transaction_max_tokens = 4000;
  // it is recommended to consider that just under 4 chars are in a token - https://platform.openai.com/tokenizer
  private readonly numberOfCharsPerToken = 3.5;
  private readonly _raw_body: OpenAIConverseBodyInternal;

  constructor(aiAssistant: AiAssistant, key?: string) {
    const {service, inputCharacterLimit} = aiAssistant;
    const config = service?.openAI?.completions as NonNullable<OpenAI['completions']>;
    super(aiAssistant, OpenAIUtils.buildKeyVerificationDetails(), OpenAIUtils.buildHeaders, config, key);
    if (typeof config === 'object') {
      // Completions with no max_tokens behave weirdly and do not give full responses
      // Client should specify their own max_tokens.
      const newMaxCharLength = inputCharacterLimit;
      if (newMaxCharLength) this._maxCharLength = newMaxCharLength;
    }
    this._raw_body = OpenAIConverseBaseBody.build(OpenAIConverseBaseBody.GPT_COMPLETIONS_DAVINCI_MODEL, config);
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
  override callApi(messages: Messages, completionsHandlers: CompletionsHandlers, streamHandlers: StreamHandlers) {
    if (!this.requestSettings) throw new Error('Request settings have not been set up');
    const body = this.preprocessBody(this._raw_body, messages.messages);
    if (body.stream) {
      HTTPRequest.requestStream(this, body, messages,
        streamHandlers.onOpen, streamHandlers.onClose, streamHandlers.abortStream);
    } else {
      HTTPRequest.request(this, body, messages, completionsHandlers.onFinish);
    }
  }

  async extractResultData(result: OpenAIConverseResult): Promise<Result> {
    if (result.error) throw result.error.message;
    return {text: result.choices[0]?.text || ''};
  }
}
