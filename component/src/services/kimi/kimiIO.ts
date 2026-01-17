import {KIMI_BUILD_HEADERS, KIMI_BUILD_KEY_VERIFICATION_DETAILS} from './utils/kimiUtils';
import {KimiRequestBody, KimiMessage, KimiToolCall} from '../../types/kimiInternal';
import {DEEP_COPY, ERROR, ROLE, TEXT} from '../../utils/consts/messageConstants';
import {INVALID_ERROR_PREFIX, OBJECT} from '../utils/serviceConstants';
import {DirectConnection} from '../../types/directConnection';
import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {Response as ResponseI} from '../../types/response';
import {DirectServiceIO} from '../utils/directServiceIO';
import {KimiResult} from '../../types/kimiResult';
import {Kimi, KimiChat} from '../../types/kimi';
import {APIKey} from '../../types/APIKey';
import {DeepChat} from '../../deepChat';

// https://platform.moonshot.ai/docs/api/chat#chat-completion
export class KimiIO extends DirectServiceIO {
  override insertKeyPlaceholderText = this.genereteAPIKeyName('Kimi');
  override keyHelpUrl = 'https://platform.moonshot.ai/console/api-keys';
  url = 'https://api.moonshot.ai/v1/chat/completions';
  permittedErrorPrefixes = [INVALID_ERROR_PREFIX, 'Not found'];
  readonly _streamToolCalls?: KimiToolCall[];

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = DEEP_COPY(deepChat.directConnection) as DirectConnection;
    const config = directConnectionCopy.kimi as Kimi & APIKey;
    super(deepChat, KIMI_BUILD_KEY_VERIFICATION_DETAILS(), KIMI_BUILD_HEADERS, config);
    if (typeof config === OBJECT) {
      this.completeConfig(config, (deepChat.directConnection?.kimi as KimiChat)?.function_handler);
    }
    this.maxMessages ??= -1;
    this.rawBody.model ??= 'moonshot-v1-8k';
  }

  private preprocessBody(body: KimiRequestBody, pMessages: MessageContentI[]) {
    const bodyCopy = DEEP_COPY(body) as KimiRequestBody;
    const processedMessages = this.processMessages(pMessages).map((message) => {
      return {
        content: KimiIO.getTextWImagesContent(message),
        [ROLE]: DirectServiceIO.getRoleViaUser(message[ROLE]),
      } as KimiMessage;
    });
    this.addSystemMessage(processedMessages);
    bodyCopy.messages = processedMessages;
    return bodyCopy;
  }

  override async callServiceAPI(messages: Messages, pMessages: MessageContentI[]) {
    this.messages ??= messages;
    this.callDirectServiceServiceAPI(messages, pMessages, this.preprocessBody.bind(this), {});
  }

  override async extractResultData(result: KimiResult, prevBody?: Kimi): Promise<ResponseI> {
    if (result[ERROR]) throw result[ERROR].message;

    if (result.choices && result.choices.length > 0) {
      const choice = result.choices[0];

      if (choice.delta) {
        return this.extractStreamResult(choice, prevBody);
      }

      if (choice.message) {
        if (choice.message.tool_calls) {
          return this.handleToolsGeneric(
            {tool_calls: choice.message.tool_calls},
            this.functionHandler,
            this.messages,
            prevBody
          );
        }
        return {[TEXT]: choice.message.content || ''};
      }
    }

    return {[TEXT]: ''};
  }

  private async extractStreamResult(choice: KimiResult['choices'][0], prevBody?: Kimi) {
    return this.extractStreamResultWToolsGeneric(this, choice, this.functionHandler, prevBody);
  }
}
