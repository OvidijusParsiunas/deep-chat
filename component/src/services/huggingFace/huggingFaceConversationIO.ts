import {AI, DEEP_COPY, ERROR, ROLE, TEXT, USER} from '../../utils/consts/messageConstants';
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
  private processMessagesI(messages: MessageContentI[]) {
    const textMessages = messages.filter((message) => message[TEXT]);
    const mostRecentMessageText = textMessages[textMessages.length - 1][TEXT];
    const previousMessages = textMessages.slice(0, textMessages.length - 1);
    if (!mostRecentMessageText) return;
    const past_user_inputs = previousMessages
      .filter((message) => message[ROLE] === USER)
      .map((message) => message[TEXT]);
    const generated_responses = previousMessages
      .filter((message) => message[ROLE] === AI)
      .map((message) => message[TEXT]);
    return {past_user_inputs, generated_responses, mostRecentMessageText};
  }

  override preprocessBody(body: HuggingFaceQuestionAnswerConfig, messages: MessageContentI[]) {
    const bodyCopy = DEEP_COPY(body) as HuggingFaceQuestionAnswerConfig & {options?: {wait_for_model?: boolean}};
    const processedMessagesDetails = this.processMessagesI(messages);
    if (!processedMessagesDetails) return;
    bodyCopy.options ??= {};
    bodyCopy.options.wait_for_model = true;
    return {
      inputs: {
        past_user_inputs: processedMessagesDetails.past_user_inputs,
        generated_responses: processedMessagesDetails.generated_responses,
        [TEXT]: processedMessagesDetails.mostRecentMessageText,
      },
      ...bodyCopy,
    } as unknown as {inputs: string};
  }

  override async extractResultData(result: HuggingFaceConversationResult): Promise<Response> {
    if (result[ERROR]) throw result[ERROR];
    return {[TEXT]: result.generated_text || ''};
  }
}
