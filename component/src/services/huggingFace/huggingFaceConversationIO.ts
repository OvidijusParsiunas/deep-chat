import {HuggingFaceConversationResult} from '../../types/huggingFaceResult';
import {HuggingFaceQuestionAnswerConfig} from '../../types/huggingFace';
import {MessageContent} from '../../types/messages';
import {HuggingFaceIO} from './huggingFaceIO';
import {Result} from '../../types/result';
import {DeepChat} from '../../deepChat';

export class HuggingFaceConversationIO extends HuggingFaceIO {
  constructor(deepChat: DeepChat) {
    // config can be undefined as this is the default method
    const config = deepChat.directConnection?.huggingFace?.conversation;
    const apiKey = deepChat.directConnection?.huggingFace;
    super(deepChat, 'Ask me anything!', 'facebook/blenderbot-400M-distill', config, apiKey);
    if (this.maxMessages === undefined) this.maxMessages = -1;
  }

  // prettier-ignore
  private processMessages(messages: MessageContent[]) {
    const mostRecentMessageText = messages[messages.length - 1].text;
    const previousMessages = messages.slice(0, messages.length - 1);
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

  override async extractResultData(result: HuggingFaceConversationResult): Promise<Result> {
    if (result.error) throw result.error;
    return {text: result.generated_text || ''};
  }
}
