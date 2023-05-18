import {CustomStyle} from './styles';

export interface TextInputStyles {
  text?: CustomStyle;
  container?: CustomStyle;
}

export interface TextInput {
  styles?: TextInputStyles;
  placeholderText?: string;
  disabled?: boolean;
  characterLimit?: number;
}
