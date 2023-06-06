import {HuggingFaceTranslationResult} from '../../types/huggingFaceResult';
import {HuggingFace} from '../../types/huggingFace';
import {HuggingFaceIO} from './huggingFaceIO';
import {AiAssistant} from '../../aiAssistant';
import {Result} from '../../types/result';

export class HuggingFaceTranslationIO extends HuggingFaceIO {
  constructor(aiAssistant: AiAssistant) {
    const config = aiAssistant.existingService?.huggingFace?.translation as NonNullable<HuggingFace['translation']>;
    super(aiAssistant, 'Insert text to translate', 't5-base', config);
  }

  override async extractResultData(result: HuggingFaceTranslationResult): Promise<Result> {
    if (result.error) throw result.error;
    return {text: result[0].translation_text || ''};
  }
}
