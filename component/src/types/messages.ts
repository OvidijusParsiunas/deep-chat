import {InterfacesUnion} from './utilityTypes';
import {MessageFile} from './messageFile';
import {CustomStyle} from './styles';

export interface MessageElementsStyles {
  // WORK - not sure if this is needed
  outerContainer?: CustomStyle;
  innerContainer?: CustomStyle;
  bubble?: CustomStyle;
  media?: CustomStyle;
}

export interface MessageRoleStyles {
  shared?: MessageElementsStyles;
  user?: MessageElementsStyles;
  ai?: MessageElementsStyles;
}

export interface MessageStyles {
  default?: MessageRoleStyles;
  image?: MessageRoleStyles;
  audio?: MessageRoleStyles;
  file?: MessageRoleStyles;
  intro?: MessageElementsStyles;
  loading?: MessageElementsStyles;
  error?: MessageElementsStyles;
}

export type MessageRole = 'user' | 'ai';

export type MessageContent = InterfacesUnion<{role: MessageRole; text: string} | {role: MessageRole; file: MessageFile}>;

export type OnNewMessage = (newMessage: {message: MessageContent; isInitial: boolean}) => void;

export interface ErrorMessageOverrides {
  default?: string;
  service?: string;
  speechToTextInput?: string;
}

export interface ErrorMessages {
  // automatically display all error messages from the service, all others automatically default
  // to the normal error structure -> type of message -> default -> 'Error, please try again.'
  displayServiceErrorMessages?: boolean;
  overrides: ErrorMessageOverrides;
}
