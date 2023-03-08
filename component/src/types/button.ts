import {StatefulStyle} from './styles';

interface ButtonInnerElementStyles {
  style?: StatefulStyle;
  string?: string;
}

export interface ButtonElementStyles {
  container?: StatefulStyle;
  svg?: ButtonInnerElementStyles;
  text?: ButtonInnerElementStyles;
}

export type ButtonPosition = 'inside-left' | 'inside-right' | 'outside-left' | 'outside-right';
