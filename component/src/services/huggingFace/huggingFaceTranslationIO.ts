import {HuggingFace, HuggingFaceTranslationConfig} from '../../types/huggingFace';
import {HuggingFaceTranslationResult} from '../../types/huggingFaceResult';
import {HuggingFaceIO} from './huggingFaceIO';
import {AiAssistant} from '../../aiAssistant';
import {Result} from '../../types/result';

export class HuggingFaceTranslationIO extends HuggingFaceIO<HuggingFaceTranslationConfig> {
  constructor(aiAssistant: AiAssistant, key?: string) {
    const config = aiAssistant.service?.huggingFace?.translation as NonNullable<HuggingFace['translation']>;
    super(aiAssistant, 'Insert text to translate', 't5-base', config, key);
  }

  async extractResultData(result: HuggingFaceTranslationResult): Promise<Result> {
    if (result.error) throw result.error;
    return {text: result[0].translation_text || ''};
  }
}
