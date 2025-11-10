import {HuggingFaceAudioRecognitionResult} from '../../types/huggingFaceResult';
import {ERROR, FILE, TEXT} from '../../utils/consts/messageConstants';
import {HuggingFaceFileIO} from './huggingFaceFileIO';
import {HuggingFace} from '../../types/huggingFace';
import {PollResult} from '../serviceIO';
import {DeepChat} from '../../deepChat';

export class HuggingFaceAudioRecognitionIO extends HuggingFaceFileIO {
  constructor(deepChat: DeepChat) {
    const config = deepChat.directConnection?.huggingFace?.audioSpeechRecognition as NonNullable<
      HuggingFace['audioSpeechRecognition']
    >;
    const apiKey = deepChat.directConnection?.huggingFace;
    super(deepChat, `Attach an audio ${FILE}`, 'facebook/wav2vec2-large-960h-lv60-self', config, apiKey, {audio: {}});
  }

  async extractPollResultData(result: HuggingFaceAudioRecognitionResult): PollResult {
    if (result.estimated_time) return {timeoutMS: (result.estimated_time + 1) * 1000};
    if (result[ERROR]) throw result[ERROR];
    return {[TEXT]: result[TEXT] || ''};
  }
}
