import {HuggingFaceFillMaskResult} from '../../types/huggingFaceResult';
import {HuggingFace} from '../../types/huggingFace';
import {HuggingFaceIO} from './huggingFaceIO';
import {AiAssistant} from '../../aiAssistant';
import {Result} from '../../types/result';

export class HuggingFaceFillMaskIO extends HuggingFaceIO {
  override introPanelMarkUp = `
    <div style="width: 100%; text-align: center; margin-left: -10px"><b>Hugging Face</b></div>
    <p>Insert a sentence with the word [MASK] and the model will try to fill it for you. E.g. I want [MASK].</p>
    <p>First message may take an extented amount of time to complete as the model needs to be initialized.</p>`;

  permittedErrorPrefixes = ['No mask_token'];

  constructor(aiAssistant: AiAssistant) {
    const config = aiAssistant.existingService?.huggingFace?.fillMask as NonNullable<HuggingFace['fillMask']>;
    super(aiAssistant, 'The goal of life is [MASK].', 'bert-base-uncased', config);
  }

  override async extractResultData(result: HuggingFaceFillMaskResult): Promise<Result> {
    if (result.error) throw result.error;
    return {text: result[0].sequence || ''};
  }
}
