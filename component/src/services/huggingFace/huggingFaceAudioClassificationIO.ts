import {HuggingFaceAudioClassificationResult} from '../../types/huggingFaceResult';
import {HuggingFaceAudioIO} from './huggingFaceAudioIO';
import {HuggingFace} from '../../types/huggingFace';
import {AiAssistant} from '../../aiAssistant';
import {PollResult} from '../serviceIO';

export class HuggingFaceAudioClassificationIO extends HuggingFaceAudioIO {
  constructor(aiAssistant: AiAssistant, key?: string) {
    const config = aiAssistant.service?.huggingFace?.audioClassification as NonNullable<
      HuggingFace['audioClassification']
    >;
    super(aiAssistant, 'Attach audio file', 'ehcalabres/wav2vec2-lg-xlsr-en-speech-emotion-recognition', config, key);
  }

  override async extractPollResultData(result: HuggingFaceAudioClassificationResult): PollResult {
    if (result.estimated_time) return {timeoutMS: (result.estimated_time + 1) * 1000};
    if (result.error) throw result.error;
    return {text: result[0]?.label || ''};
  }
}
