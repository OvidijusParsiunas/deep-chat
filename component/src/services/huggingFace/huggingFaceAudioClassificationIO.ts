import {HuggingFaceClassificationResult} from '../../types/huggingFaceResult';
import {ERROR, FILE, TEXT} from '../../utils/consts/messageConstants';
import {HuggingFaceFileIO} from './huggingFaceFileIO';
import {HuggingFace} from '../../types/huggingFace';
import {PollResult} from '../serviceIO';
import {DeepChat} from '../../deepChat';

export class HuggingFaceAudioClassificationIO extends HuggingFaceFileIO {
  // prettier-ignore
  constructor(deepChat: DeepChat) {
    const config = deepChat.directConnection?.huggingFace?.audioClassification as NonNullable<
      HuggingFace['audioClassification']
    >;
    const apiKey = deepChat.directConnection?.huggingFace;
    super(deepChat,
      `Attach an audio ${FILE}`, 'ehcalabres/wav2vec2-lg-xlsr-en-speech-emotion-recognition', config, apiKey, {audio: {}});
  }

  async extractPollResultData(result: HuggingFaceClassificationResult): PollResult {
    if (result.estimated_time) return {timeoutMS: (result.estimated_time + 1) * 1000};
    if (result[ERROR]) throw result[ERROR];
    return {[TEXT]: result[0]?.label || ''};
  }
}
