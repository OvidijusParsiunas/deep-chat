import {ButtonStyles} from './button';
import {CustomStyle} from './styles';

export type OpenAIRealtimeButton = {
  default?: ButtonStyles;
  active?: ButtonStyles;
  unsupported?: ButtonStyles;
};

// https://platform.openai.com/docs/api-reference/realtime
export type OpenAIRealTime = {
  avatar?: {
    src?: string;
    maxScale?: number;
    styles?: {
      avatar?: CustomStyle;
      container?: CustomStyle;
    };
  };
  buttons?: {
    microphone?: OpenAIRealtimeButton;
    toggle?: OpenAIRealtimeButton;
  };
};
