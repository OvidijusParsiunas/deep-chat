import {HuggingFaceSummarizationResult} from '../../types/huggingFaceResult';
import {HuggingFace} from '../../types/huggingFace';
import {HuggingFaceIO} from './huggingFaceIO';
import {AiAssistant} from '../../aiAssistant';
import {Result} from '../../types/result';

export class HuggingFaceSummarizationIO extends HuggingFaceIO {
  constructor(aiAssistant: AiAssistant) {
    const config = aiAssistant.service?.huggingFace?.summarization as NonNullable<HuggingFace['summarization']>;
    super(aiAssistant, 'Insert text to summarize', 'facebook/bart-large-cnn', config);
  }

  override async extractResultData(result: HuggingFaceSummarizationResult): Promise<Result> {
    if (result.error) throw result.error;
    return {text: result[0].summary_text || ''};
  }
}
