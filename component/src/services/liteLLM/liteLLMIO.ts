import {AUTHENTICATION_ERROR_PREFIX, INVALID_REQUEST_ERROR_PREFIX, OBJECT} from '../utils/serviceConstants';
import {LITELLM_BUILD_HEADERS, LITELLM_BUILD_KEY_VERIFICATION_DETAILS} from './utils/liteLLMUtils';
import {LiteLLMRequestBody, LiteLLMMessage} from '../../types/liteLLMInternal';
import {DEEP_COPY, ERROR, ROLE, TEXT} from '../../utils/consts/messageConstants';
import {DirectConnection} from '../../types/directConnection';
import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {Response as ResponseI} from '../../types/response';
import {LiteLLMResult} from '../../types/liteLLMResult';
import {DirectServiceIO} from '../utils/directServiceIO';
import {LiteLLM} from '../../types/liteLLM';
import {APIKey} from '../../types/APIKey';
import {DeepChat} from '../../deepChat';

// https://docs.litellm.ai/docs/
export class LiteLLMIO extends DirectServiceIO {
  override insertKeyPlaceholderText = this.genereteAPIKeyName('LiteLLM');
  override keyHelpUrl = 'https://docs.litellm.ai/docs/simple_proxy#quick-start';
  url = 'http://localhost:4000/v1/chat/completions';
  permittedErrorPrefixes = [INVALID_REQUEST_ERROR_PREFIX, AUTHENTICATION_ERROR_PREFIX];

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = DEEP_COPY(deepChat.directConnection) as DirectConnection;
    const config = directConnectionCopy.liteLLM as LiteLLM & APIKey;
    const configUrl =
      typeof config === OBJECT && (config as LiteLLM & {url?: string}).url
        ? (config as LiteLLM & {url?: string}).url!
        : 'http://localhost:4000/v1/chat/completions';
    super(deepChat, LITELLM_BUILD_KEY_VERIFICATION_DETAILS(configUrl), LITELLM_BUILD_HEADERS, config);
    if (typeof config === OBJECT) {
      if ((config as LiteLLM & {url?: string}).url) {
        this.url = (config as LiteLLM & {url?: string}).url!;
      }
      this.completeConfig(config);
    }
    this.maxMessages ??= -1;
    this.rawBody.model ??= 'gpt-4o-mini';
    this.rawBody.temperature ??= 1;
    this.rawBody.max_tokens ??= 4096;
  }

  private preprocessBody(body: LiteLLMRequestBody, pMessages: MessageContentI[]) {
    const bodyCopy = DEEP_COPY(body) as LiteLLMRequestBody;
    const processedMessages = this.processMessages(pMessages).map((message) => {
      return {
        content: message[TEXT] || '',
        [ROLE]: DirectServiceIO.getRoleViaUser(message[ROLE]),
      } as LiteLLMMessage;
    });
    this.addSystemMessage(processedMessages);
    bodyCopy.messages = processedMessages;
    return bodyCopy;
  }

  override async callServiceAPI(messages: Messages, pMessages: MessageContentI[]) {
    this.callDirectServiceServiceAPI(messages, pMessages, this.preprocessBody.bind(this), {});
  }

  override async extractResultData(result: LiteLLMResult): Promise<ResponseI> {
    if (result[ERROR]) throw result[ERROR].message;

    if (result.choices && result.choices.length > 0) {
      const choice = result.choices[0];

      if (choice.delta && choice.delta.content) {
        return {[TEXT]: choice.delta.content};
      }

      if (choice.message && choice.message.content) {
        return {[TEXT]: choice.message.content};
      }
    }

    return {[TEXT]: ''};
  }
}
