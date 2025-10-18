import {HuggingFaceTranslationResult} from '../../types/huggingFaceResult';
import {ERROR, TEXT} from '../../utils/consts/messageConstants';
import {HuggingFace} from '../../types/huggingFace';
import {HuggingFaceIO} from './huggingFaceIO';
import {Response} from '../../types/response';
import {DeepChat} from '../../deepChat';

export class HuggingFaceTranslationIO extends HuggingFaceIO {
  constructor(deepChat: DeepChat) {
    const config = deepChat.directConnection?.huggingFace?.translation as NonNullable<HuggingFace['translation']>;
    const apiKey = deepChat.directConnection?.huggingFace;
    super(deepChat, 'Insert text to translate', 'Helsinki-NLP/opus-tatoeba-en-ja', config, apiKey);
  }

  override async extractResultData(result: HuggingFaceTranslationResult): Promise<Response> {
    if (result[ERROR]) throw result[ERROR];
    return {[TEXT]: result[0]?.translation_text || ''};
  }
}
