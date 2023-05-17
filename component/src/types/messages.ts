import {InterfacesUnion} from './utilityTypes';
import {MessageFile} from './messageFile';
import {CustomStyle} from './styles';

export interface MessageElementsStyles {
  outerContainer?: CustomStyle;
  innerContainer?: CustomStyle;
  bubble?: CustomStyle;
  media?: CustomStyle;
}

export interface MessageSideStyles {
  shared?: MessageElementsStyles;
  user?: MessageElementsStyles;
  ai?: MessageElementsStyles;
}

export interface MessageStyles {
  default?: MessageSideStyles;
  image?: MessageSideStyles;
  audio?: MessageSideStyles;
  file?: MessageSideStyles;
  intro?: MessageElementsStyles;
  loading?: MessageElementsStyles;
  error?: MessageElementsStyles;
}

export type MessageRole = 'user' | 'ai';

export type MessageContent = InterfacesUnion<{role: MessageRole; text: string} | {role: MessageRole; file: MessageFile}>;

export type OnNewMessage = (message: MessageContent, isInitial: boolean) => void;

export interface ErrorMessageOverrides {
  default?: string;
  chat?: string;
  speechToTextInput?: string;
}
