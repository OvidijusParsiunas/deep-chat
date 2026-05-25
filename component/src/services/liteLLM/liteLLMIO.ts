import {LITELLM_BUILD_HEADERS, LITELLM_BUILD_KEY_VERIFICATION_DETAILS} from './utils/liteLLMUtils';
import {AUTHENTICATION_ERROR_PREFIX, INVALID_REQUEST_ERROR_PREFIX, OBJECT} from '../utils/serviceConstants';
import {DEEP_COPY, ERROR, ROLE, TEXT} from '../../utils/consts/messageConstants';
import {LiteLLMRequestBody, LiteLLMMessage} from '../../types/liteLLMInternal';
import {DirectConnection} from '../../types/directConnection';
import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {Response as ResponseI} from '../../types/response';
import {DirectServiceIO} from '../utils/directServiceIO';
import {LiteLLMResult} from '../../types/liteLLMResult';
import {LiteLLMChat} from '../../types/liteLLM';
import {DeepChat} from '../../deepChat';

// https://docs.litellm.ai/docs/
export class LiteLLMIO extends DirectServiceIO {
  override insertKeyPlaceholderText = '';
  override keyHelpUrl = '';
  override validateKeyProperty = false;
  url = 'http://localhost:4000/v1/chat/completions';
  permittedErrorPrefixes = [INVALID_REQUEST_ERROR_PREFIX, AUTHENTICATION_ERROR_PREFIX];

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = DEEP_COPY(deepChat.directConnection) as DirectConnection;
    super(deepChat, LITELLM_BUILD_KEY_VERIFICATION_DETAILS(), LITELLM_BUILD_HEADERS, {key: 'placeholder'});
    const config = directConnectionCopy.liteLLM as LiteLLMChat;
    if (typeof config === OBJECT) {
      if (config.url) {
        this.url = config.url;
        delete config.url;
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
