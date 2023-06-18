import {ErrorMessageOverrides} from './messages';

export type DemoErrors = {[key in keyof ErrorMessageOverrides]?: boolean};

export type Demo =
  | true
  | {displayErrors?: DemoErrors; displayLoadingBubble?: boolean; displayFileAttachmentContainer?: boolean};
