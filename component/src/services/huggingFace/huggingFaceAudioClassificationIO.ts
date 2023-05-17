import {HuggingFaceClassificationResult} from '../../types/huggingFaceResult';
import {HuggingFaceFileIO} from './huggingFaceFileIO';
import {HuggingFace} from '../../types/huggingFace';
import {AiAssistant} from '../../aiAssistant';
import {PollResult} from '../serviceIO';

export class HuggingFaceAudioClassificationIO extends HuggingFaceFileIO {
  // prettier-ignore
  constructor(aiAssistant: AiAssistant) {
    const config = aiAssistant.service?.huggingFace?.audioClassification as NonNullable<
      HuggingFace['audioClassification']
    >;
    super(aiAssistant,
      'Attach an audio file', 'ehcalabres/wav2vec2-lg-xlsr-en-speech-emotion-recognition', config, 'audio');
  }

  async extractPollResultData(result: HuggingFaceClassificationResult): PollResult {
    if (result.estimated_time) return {timeoutMS: (result.estimated_time + 1) * 1000};
    if (result.error) throw result.error;
    return {text: result[0]?.label || ''};
  }
}
