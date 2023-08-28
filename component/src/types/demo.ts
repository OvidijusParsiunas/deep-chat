import {ErrorMessageOverrides, MessageContent} from './messages';
import {CustomServiceResponse} from './customService';

export type DemoErrors = {[key in keyof ErrorMessageOverrides]?: boolean};

export type DemoResponse = CustomServiceResponse | ((message: MessageContent) => CustomServiceResponse);

export type Demo =
  | true
  | {
      response?: DemoResponse;
      displayErrors?: DemoErrors;
      displayLoadingBubble?: boolean;
      displayFileAttachmentContainer?: boolean;
    };
