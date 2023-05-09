import {HuggingFace, HuggingFaceTextGenerationConfig} from '../../types/huggingFace';
import {HuggingFaceTextGenerationResult} from '../../types/huggingFaceResult';
import {HuggingFaceIO} from './huggingFaceIO';
import {AiAssistant} from '../../aiAssistant';
import {Result} from '../../types/result';

export class HuggingFaceTextGenerationIO extends HuggingFaceIO<HuggingFaceTextGenerationConfig> {
  constructor(aiAssistant: AiAssistant, key?: string) {
    const config = aiAssistant.service?.huggingFace?.textGeneration as NonNullable<HuggingFace['textGeneration']>;
    super(aiAssistant, 'Once upon a time', 'gpt2', config, key);
  }

  async extractResultData(result: HuggingFaceTextGenerationResult): Promise<Result> {
    if (result.error) throw result.error;
    return {text: result[0].generated_text || ''};
  }
}
