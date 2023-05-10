import {HuggingFaceQuestionAnswerConfig, HuggingFaceConversationConfig, HuggingFace} from '../../types/huggingFace';
import {HuggingFaceConversationResult} from '../../types/huggingFaceResult';
import {MessageLimitUtils} from '../utils/messageLimitUtils';
import {MessageContent} from '../../types/messages';
import {HuggingFaceIO} from './huggingFaceIO';
import {AiAssistant} from '../../aiAssistant';
import {Result} from '../../types/result';

export class HuggingFaceConversationIO extends HuggingFaceIO<HuggingFaceConversationConfig> {
  private readonly _total_messages_max_char_length?: number;
  private readonly _max_messages?: number;

  constructor(aiAssistant: AiAssistant, key?: string) {
    const config = aiAssistant.service?.huggingFace?.conversation as NonNullable<HuggingFace['conversation']>;
    super(aiAssistant, 'Ask me anything!', 'microsoft/DialoGPT-large', config, key);
    if (typeof config === 'object') {
      this._total_messages_max_char_length = config.total_messages_max_char_length;
      if (config.max_messages) {
        // needs to be an odd number in order to have an array of previous correspondences and the new user message
        this._max_messages = config.max_messages % 0 ? config.max_messages + 1 : config.max_messages;
      }
    }
  }

  // prettier-ignore
  private processMessages(messages: MessageContent[]) {
    const processedMessages = MessageLimitUtils.processMessages(
      messages, 0, this._max_messages, this._total_messages_max_char_length);
    const mostRecentMessageText = processedMessages[processedMessages.length - 1].text;
    const previousMessages = processedMessages.slice(0, processedMessages.length - 1);
    if (!mostRecentMessageText) return;
    const past_user_inputs = previousMessages.filter((message) => message.role === 'user').map((message) => message.text);
    const generated_responses = previousMessages
      .filter((message) => message.role === 'ai')
      .map((message) => message.text);
    return {past_user_inputs, generated_responses, mostRecentMessageText};
  }

  // prettier-ignore
  override preprocessBody(body: HuggingFaceQuestionAnswerConfig, messages: MessageContent[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body)) as HuggingFaceQuestionAnswerConfig & {
      options?: {wait_for_model?: boolean};
    };
    const processedMessagesDetails = this.processMessages(messages);
    if (!processedMessagesDetails) return;
    bodyCopy.options ??= {};
    bodyCopy.options.wait_for_model = true;
    return {
      inputs: {
        past_user_inputs: processedMessagesDetails.past_user_inputs,
        generated_responses: processedMessagesDetails.generated_responses,
        text: processedMessagesDetails.mostRecentMessageText,
      },
      ...bodyCopy,
    } as unknown as {inputs: string};
  }

  async extractResultData(result: HuggingFaceConversationResult): Promise<Result> {
    if (result.error) throw result.error;
    return {text: result.generated_text || ''};
  }
}
