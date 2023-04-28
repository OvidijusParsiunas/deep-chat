import {InterfacesUnion} from './utilityTypes';
import {MessageFile} from './messageFile';
import {CustomStyle} from './styles';

export interface MessageElementStyles {
  outerContainer?: CustomStyle;
  innerContainer?: CustomStyle;
  bubble?: CustomStyle;
  media?: CustomStyle;
}

export interface MessageSideStyles {
  shared?: MessageElementStyles;
  user?: MessageElementStyles;
  ai?: MessageElementStyles;
}

export interface MessageStyles {
  default?: MessageSideStyles;
  image?: MessageSideStyles;
  audio?: MessageSideStyles;
  file?: MessageSideStyles;
  intro?: MessageElementStyles;
  loading?: MessageElementStyles;
  error?: MessageElementStyles;
}

export type MessageRole = 'user' | 'assistant';

export type MessageContent = InterfacesUnion<{role: MessageRole; text: string} | {role: MessageRole; file: MessageFile}>;

export type OnNewMessage = (message: MessageContent, isInitial: boolean) => void;

export interface ErrorMessageOverrides {
  default?: string;
  chat?: string;
  speechInput?: string;
}
