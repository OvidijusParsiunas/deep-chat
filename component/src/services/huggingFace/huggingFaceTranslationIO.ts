import {HuggingFaceTranslationResult} from '../../types/huggingFaceResult';
import {HuggingFace} from '../../types/huggingFace';
import {HuggingFaceIO} from './huggingFaceIO';
import {Result} from '../../types/result';
import {DeepChat} from '../../deepChat';

export class HuggingFaceTranslationIO extends HuggingFaceIO {
  constructor(deepChat: DeepChat) {
    const config = deepChat.existingService?.huggingFace?.translation as NonNullable<HuggingFace['translation']>;
    const apiKey = deepChat.existingService?.huggingFace;
    super(deepChat, 'Insert text to translate', 't5-base', config, apiKey);
  }

  override async extractResultData(result: HuggingFaceTranslationResult): Promise<Result> {
    if (result.error) throw result.error;
    return {text: result[0].translation_text || ''};
  }
}
