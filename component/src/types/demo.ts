import {ErrorMessageOverrides} from './error';
import {MessageContent} from './messages';
import {Response} from './response';

export type DemoErrors = {[key in keyof ErrorMessageOverrides]?: boolean};

export type DemoResponse = Response | ((message: MessageContent) => Response);

export type Demo =
  | true
  | {
      response?: DemoResponse;
      displayErrors?: DemoErrors;
      displayLoadingBubble?: boolean;
      displayFileAttachmentContainer?: boolean;
    };
