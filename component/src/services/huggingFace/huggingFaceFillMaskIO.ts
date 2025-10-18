import {HuggingFaceFillMaskResult} from '../../types/huggingFaceResult';
import {ERROR, TEXT} from '../../utils/consts/messageConstants';
import {AUTHORIZATION_HEADER} from '../utils/serviceConstants';
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
    if (result[ERROR]) throw result[ERROR];
    return {[TEXT]: result[0]?.sequence || ''};
  }
}
