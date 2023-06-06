import {HuggingFaceTextGenerationResult} from '../../types/huggingFaceResult';
import {HuggingFace} from '../../types/huggingFace';
import {HuggingFaceIO} from './huggingFaceIO';
import {AiAssistant} from '../../aiAssistant';
import {Result} from '../../types/result';

export class HuggingFaceTextGenerationIO extends HuggingFaceIO {
  constructor(aiAssistant: AiAssistant) {
    const config = aiAssistant.service?.huggingFace?.textGeneration as NonNullable<HuggingFace['textGeneration']>;
    super(aiAssistant, 'Once upon a time', 'gpt2', config);
  }

  override async extractResultData(result: HuggingFaceTextGenerationResult): Promise<Result> {
    if (result.error) throw result.error;
    return {text: result[0].generated_text || ''};
  }
}
