import {ErrorMessageOverrides, MessageContent} from './messages';
import {Result} from './result';

export type DemoErrors = {[key in keyof ErrorMessageOverrides]?: boolean};

export type DemoResponse = Result | ((message: MessageContent) => Result);

export type Demo =
  | true
  | {
      response?: DemoResponse;
      displayErrors?: DemoErrors;
      displayLoadingBubble?: boolean;
      displayFileAttachmentContainer?: boolean;
    };
