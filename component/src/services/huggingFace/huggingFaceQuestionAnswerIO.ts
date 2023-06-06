import {HuggingFace, HuggingFaceQuestionAnswerConfig} from '../../types/huggingFace';
import {HuggingFaceQuestionAnswerResult} from '../../types/huggingFaceResult';
import {MessageContent} from '../../types/messages';
import {HuggingFaceIO} from './huggingFaceIO';
import {AiAssistant} from '../../aiAssistant';
import {Result} from '../../types/result';

export class HuggingFaceQuestionAnswerIO extends HuggingFaceIO {
  permittedErrorPrefixes = ['Error in'];

  private readonly context: string;

  constructor(aiAssistant: AiAssistant) {
    const config = aiAssistant.existingService?.huggingFace?.questionAnswer as NonNullable<HuggingFace['questionAnswer']>;
    super(aiAssistant, 'Ask a question', 'bert-large-uncased-whole-word-masking-finetuned-squad', config);
    this.context = config.context;
  }

  override preprocessBody(_: HuggingFaceQuestionAnswerConfig, messages: MessageContent[]) {
    const mostRecentMessageText = messages[messages.length - 1].text;
    if (!mostRecentMessageText) return;
    return {
      inputs: {question: mostRecentMessageText, context: this.context, options: {wait_for_model: true}},
    } as unknown as {inputs: string};
  }

  override async extractResultData(result: HuggingFaceQuestionAnswerResult): Promise<Result> {
    if (result.error) throw result.error;
    return {text: result.answer || ''};
  }
}
