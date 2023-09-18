import {CustomStyle} from './styles';

export interface TextInputStyles {
  text?: CustomStyle;
  container?: CustomStyle;
  focus?: CustomStyle;
}

export interface Placeholder {
  text?: string;
  style?: CustomStyle;
}

export interface TextInput {
  styles?: TextInputStyles;
  characterLimit?: number;
  placeholder?: Placeholder;
  disabled?: boolean;
}
