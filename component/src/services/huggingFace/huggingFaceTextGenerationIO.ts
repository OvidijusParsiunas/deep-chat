import {HuggingFaceTextGenerationResult} from '../../types/huggingFaceResult';
import {TEXT_KEY} from '../../utils/consts/messageConstants';
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
    if (result.error) throw result.error;
    return {[TEXT_KEY]: result[0]?.generated_text || ''};
  }
}
