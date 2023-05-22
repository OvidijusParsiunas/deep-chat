export type DemoErrors = {
  service?: boolean;
  speechToTextInput?: boolean;
};

export type Demo =
  | boolean
  | {displayErrors?: DemoErrors; displayLoadingBubble?: boolean; displayFileAttachmentContainer?: boolean};
