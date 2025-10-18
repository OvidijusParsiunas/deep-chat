import {HuggingFaceTextGenerationResult} from '../../types/huggingFaceResult';
import {ERROR, TEXT} from '../../utils/consts/messageConstants';
import {HuggingFace} from '../../types/huggingFace';
import {HuggingFaceIO} from './huggingFaceIO';
import {Response} from '../../types/response';
import {DeepChat} from '../../deepChat';

export class HuggingFaceTextGenerationIO extends HuggingFaceIO {
  constructor(deepChat: DeepChat) {
    const config = deepChat.directConnection?.huggingFace?.textGeneration as NonNullable<HuggingFace['textGeneration']>;
    const apiKey = deepChat.directConnection?.huggingFace;
    super(deepChat, 'Once upon a time', 'gpt2', config, apiKey);
  }

  override async extractResultData(result: HuggingFaceTextGenerationResult): Promise<Response> {
    if (result[ERROR]) throw result[ERROR];
    return {[TEXT]: result[0]?.generated_text || ''};
  }
}
