import {HuggingFaceSummarizationResult} from '../../types/huggingFaceResult';
import {HuggingFace} from '../../types/huggingFace';
import {HuggingFaceIO} from './huggingFaceIO';
import {Result} from '../../types/result';
import {DeepChat} from '../../deepChat';

export class HuggingFaceSummarizationIO extends HuggingFaceIO {
  constructor(deepChat: DeepChat) {
    const config = deepChat.directConnection?.huggingFace?.summarization as NonNullable<HuggingFace['summarization']>;
    const apiKey = deepChat.directConnection?.huggingFace;
    super(deepChat, 'Insert text to summarize', 'facebook/bart-large-cnn', config, apiKey);
  }

  override async extractResultData(result: HuggingFaceSummarizationResult): Promise<Result> {
    if (result.error) throw result.error;
    return {text: result[0].summary_text || ''};
  }
}
