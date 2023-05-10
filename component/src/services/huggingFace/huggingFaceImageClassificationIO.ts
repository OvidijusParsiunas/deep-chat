import {HuggingFaceClassificationResult} from '../../types/huggingFaceResult';
import {HuggingFaceFileIO} from './huggingFaceFileIO';
import {HuggingFace} from '../../types/huggingFace';
import {AiAssistant} from '../../aiAssistant';
import {PollResult} from '../serviceIO';

export class HuggingFaceImageClassificationIO extends HuggingFaceFileIO {
  constructor(aiAssistant: AiAssistant, key?: string) {
    const config = aiAssistant.service?.huggingFace?.imageClassification as NonNullable<
      HuggingFace['imageClassification']
    >;
    super(aiAssistant, 'Attach an image file', 'google/vit-base-patch16-224', config, 'images', key);
  }

  async extractPollResultData(result: HuggingFaceClassificationResult): PollResult {
    if (result.estimated_time) return {timeoutMS: (result.estimated_time + 1) * 1000};
    if (result.error) throw result.error;
    return {text: result[0]?.label || ''};
  }
}
