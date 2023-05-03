import {StatefulStyles} from './styles';

interface ButtonInnerElementStyles {
  styles?: StatefulStyles;
  content?: string;
}

export interface ButtonElementStyles {
  container?: StatefulStyles;
  svg?: ButtonInnerElementStyles;
  text?: ButtonInnerElementStyles;
}

export type ButtonPosition = 'inside-left' | 'inside-right' | 'outside-left' | 'outside-right' | 'dropup-menu';

export interface GenericButton {
  styles?: ButtonElementStyles;
  position?: ButtonPosition;
}
