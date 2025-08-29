import {HuggingFaceConversationResult} from '../../types/huggingFaceResult';
import {HuggingFaceQuestionAnswerConfig} from '../../types/huggingFace';
import {MessageContentI} from '../../types/messagesInternal';
import {HuggingFaceIO} from './huggingFaceIO';
import {Response} from '../../types/response';
import {DeepChat} from '../../deepChat';

export class HuggingFaceConversationIO extends HuggingFaceIO {
  constructor(deepChat: DeepChat) {
    // config can be undefined as this is the default method
    const config = deepChat.directConnection?.huggingFace?.conversation;
    const apiKey = deepChat.directConnection?.huggingFace;
    super(deepChat, 'Ask me anything!', 'facebook/blenderbot-400M-distill', config, apiKey);
    this.maxMessages ??= -1;
  }

  // prettier-ignore
  private processMessages(messages: MessageContentI[]) {
    const textMessages = messages.filter((message) => message.text);
    const mostRecentMessageText = textMessages[textMessages.length - 1].text;
    const previousMessages = textMessages.slice(0, textMessages.length - 1);
    if (!mostRecentMessageText) return;
    const past_user_inputs = previousMessages.filter((message) => message.role === 'user').map((message) => message.text);
    const generated_responses = previousMessages
      .filter((message) => message.role === 'ai')
      .map((message) => message.text);
    return {past_user_inputs, generated_responses, mostRecentMessageText};
  }

  // prettier-ignore
  override preprocessBody(body: HuggingFaceQuestionAnswerConfig, messages: MessageContentI[]) {
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

  override async extractResultData(result: HuggingFaceConversationResult): Promise<Response> {
    if (result.error) throw result.error;
    return {text: result.generated_text || ''};
  }
}
