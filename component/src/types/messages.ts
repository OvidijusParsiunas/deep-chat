import {CustomStyle} from './styles';

export interface CustomMessageStyle {
  outerContainer?: CustomStyle;
  innerContainer?: CustomStyle;
  text?: CustomStyle;
}

export interface CustomMessageStyles {
  default?: CustomMessageStyle;
  user?: CustomMessageStyle;
  ai?: CustomMessageStyle;
}

export type MessageContent = {role: 'user' | 'ai'; text: string};

export type OnNewMessage = (message: MessageContent) => void;

export interface ErrorMessage {
  text?: string;
  styles?: CustomMessageStyle;
}
