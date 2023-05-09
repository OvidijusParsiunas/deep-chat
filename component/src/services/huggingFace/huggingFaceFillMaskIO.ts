import {HuggingFace, HuggingFaceFillMaskConfig} from '../../types/huggingFace';
import {HuggingFillMaskResult} from '../../types/huggingFaceResult';
import {HuggingFaceIO} from './huggingFaceIO';
import {AiAssistant} from '../../aiAssistant';
import {Result} from '../../types/result';

export class HuggingFaceFillMaskIO extends HuggingFaceIO<HuggingFaceFillMaskConfig> {
  override introPanelMarkUp = `
  <div style="width: 100%; text-align: center; margin-left: -10px"><b>Hugging Face</b></div>
  <p>Insert a sentence with the word [MASK] and the model will try to fill it for you. E.g. I want [MASK].</p>
  <p>First message may take an extented amount of time to complete as the model needs to be initialized.</p>`;

  permittedErrorPrefixes = new Set('No mask_token');

  constructor(aiAssistant: AiAssistant, key?: string) {
    const config = aiAssistant.service?.huggingFace?.fillMask as NonNullable<HuggingFace['fillMask']>;
    super(aiAssistant, 'The goal of life is [MASK].', 'bert-base-uncased', config, key);
  }

  async extractResultData(result: HuggingFillMaskResult): Promise<Result> {
    if (result.error) throw result.error;
    return {text: result[0].sequence || ''};
  }
}
