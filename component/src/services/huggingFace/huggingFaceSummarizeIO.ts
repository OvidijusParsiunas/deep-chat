import {HuggingFace, HuggingFaceSummarizeConfig} from '../../types/huggingFace';
import {HuggingFaceSummarizeResult} from '../../types/huggingFaceResult';
import {HuggingFaceIO} from './huggingFaceIO';
import {AiAssistant} from '../../aiAssistant';
import {Result} from '../../types/result';

export class HuggingFaceSummarizeIO extends HuggingFaceIO<HuggingFaceSummarizeConfig> {
  constructor(aiAssistant: AiAssistant, key?: string) {
    const config = aiAssistant.service?.huggingFace?.summarize as NonNullable<HuggingFace['summarize']>;
    super(aiAssistant, 'Insert text to summarize', 'facebook/bart-large-cnn', config, key);
  }

  async extractResultData(result: HuggingFaceSummarizeResult): Promise<Result> {
    if (result.error) throw result.error;
    return {text: result[0].summary_text || ''};
  }
}
