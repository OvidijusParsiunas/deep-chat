import {CustomStyle} from './styles';

// TO-DO add a different style type for image and audio
export interface MessageElementStyles {
  outerContainer?: CustomStyle;
  innerContainer?: CustomStyle;
  bubble?: CustomStyle;
  media?: CustomStyle;
}

export interface MessageStyles {
  default?: MessageElementStyles;
  user?: MessageElementStyles;
  ai?: MessageElementStyles;
  loading?: MessageElementStyles;
  error?: MessageElementStyles;
  intro?: MessageElementStyles;
}

export type MessageType = 'text' | 'image' | 'audio' | 'file';

export type MessageContent = {role: 'user' | 'assistant'; content: string; type: MessageType};

export type OnNewMessage = (message: MessageContent, isInitial: boolean) => void;

export interface ErrorMessageOverrides {
  default?: string;
  chat?: string;
  speechInput?: string;
}
