import {CustomStyle} from './styles';

export interface CustomMessageStyle {
  outerContainer?: CustomStyle;
  innerContainer?: CustomStyle;
  bubble?: CustomStyle;
  text?: CustomStyle;
  image?: CustomStyle;
}

export interface CustomMessageStyles {
  default?: CustomMessageStyle;
  user?: CustomMessageStyle;
  ai?: CustomMessageStyle;
}

export type MessageContent = {role: 'user' | 'assistant'; content: string};

export type OnNewMessage = (message: MessageContent, isInitial: boolean) => void;

export interface IntroMessage {
  content: string;
  styles?: CustomMessageStyle;
}

export interface ErrorMessage {
  text?: string;
  styles?: CustomMessageStyle;
}

export interface ErrorMessages {
  default?: ErrorMessage;
  chat?: ErrorMessage;
  speechInput?: ErrorMessage;
}
