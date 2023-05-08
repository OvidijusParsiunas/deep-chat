import {HuggingFace, HuggingFaceConversationConfig, HuggingFaceQuestionAnswerConfig} from '../../types/huggingFace';
import {HuggingConversationResult} from '../../types/huggingFaceResult';
import {MessageContent} from '../../types/messages';
import {HuggingFaceIO} from './huggingFaceIO';
import {AiAssistant} from '../../aiAssistant';
import {Result} from '../../types/result';

export class HuggingFaceConversationIO extends HuggingFaceIO<HuggingFaceConversationConfig> {
  constructor(aiAssistant: AiAssistant, key?: string) {
    const config = aiAssistant.huggingFace?.questionAnswer as NonNullable<HuggingFace['questionAnswer']>;
    super(aiAssistant, 'Ask me anything!', 'microsoft/DialoGPT-large', config, key);
  }

  override preprocessBody(body: HuggingFaceQuestionAnswerConfig, messages: MessageContent[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body)) as HuggingFaceQuestionAnswerConfig & {
      options?: {wait_for_model?: boolean};
    };
    const mostRecentMessageText = messages[messages.length - 1].text;
    const previousMessages = messages.slice(0, messages.length - 1);
    if (!mostRecentMessageText) return;
    const past_user_inputs = previousMessages.filter((message) => message.role === 'user').map((message) => message.text);
    const generated_responses = previousMessages
      .filter((message) => message.role === 'assistant')
      .map((message) => message.text);
    bodyCopy.options ??= {};
    bodyCopy.options.wait_for_model = true;
    return {
      inputs: {
        past_user_inputs,
        generated_responses,
        text: mostRecentMessageText,
      },
      ...bodyCopy,
    } as unknown as {inputs: string};
  }

  async extractResultData(result: HuggingConversationResult): Promise<Result> {
    if (result.error) throw result.error;
    return {text: result.generated_text || ''};
  }
}
