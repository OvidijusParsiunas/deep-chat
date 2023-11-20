import {InterfacesUnion} from './utilityTypes';
import {MessageFile} from './messageFile';
import {CustomStyle} from './styles';

export interface MessageElementsStyles {
  outerContainer?: CustomStyle;
  innerContainer?: CustomStyle;
  bubble?: CustomStyle;
  media?: CustomStyle;
}

export type MessageRoleStyles = {
  shared?: MessageElementsStyles;
  user?: MessageElementsStyles;
  ai?: MessageElementsStyles;
} & {[role: string]: MessageElementsStyles};

export interface MessageStyles {
  default?: MessageRoleStyles;
  image?: MessageRoleStyles;
  audio?: MessageRoleStyles;
  file?: MessageRoleStyles;
  html?: MessageRoleStyles;
  intro?: MessageElementsStyles;
  loading?: MessageElementsStyles;
  error?: MessageElementsStyles;
}

export type MessageContent = {role?: string; text?: string; files?: MessageFile[]; html?: string; _sessionId?: string};

export type OnNewMessage = (newMessage: {message: MessageContent; isInitial: boolean}) => void;

export type IntroMessage = InterfacesUnion<{text: string} | {html: string}>;

export type UserContent = {text?: string; files?: File[] | FileList};

export interface ErrorMessageOverrides {
  default?: string;
  service?: string;
  speechToText?: string;
}

export interface ErrorMessages {
  // automatically display all error messages from the service, all others automatically default
  // to the normal error structure -> type of message -> default -> 'Error, please try again.'
  displayServiceErrorMessages?: boolean;
  overrides?: ErrorMessageOverrides;
}
