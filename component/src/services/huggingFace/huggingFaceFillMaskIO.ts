import {HuggingFaceFillMaskResult} from '../../types/huggingFaceResult';
import {AUTHORIZATION_HEADER} from '../utils/serviceConstants';
import {TEXT_KEY} from '../../utils/consts/messageConstants';
import {HuggingFace} from '../../types/huggingFace';
import {HuggingFaceIO} from './huggingFaceIO';
import {Response} from '../../types/response';
import {DeepChat} from '../../deepChat';

export class HuggingFaceFillMaskIO extends HuggingFaceIO {
  override permittedErrorPrefixes = [AUTHORIZATION_HEADER, 'No mask_token'];

  constructor(deepChat: DeepChat) {
    const config = deepChat.directConnection?.huggingFace?.fillMask as NonNullable<HuggingFace['fillMask']>;
    const apiKey = deepChat.directConnection?.huggingFace;
    super(deepChat, 'The goal of life is [MASK].', 'bert-base-uncased', config, apiKey);
  }

  override async extractResultData(result: HuggingFaceFillMaskResult): Promise<Response> {
    if (result.error) throw result.error;
    return {[TEXT_KEY]: result[0]?.sequence || ''};
  }
}
