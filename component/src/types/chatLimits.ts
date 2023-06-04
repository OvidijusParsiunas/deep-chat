export interface RequestBodyMessageLimits {
  maxMessages?: number;
  totalMessagesMaxCharLength?: number;
  lastMessageOnly?: boolean;
  // WORK - this will need some refactoring as limits apply with text only
}
