import {StatefulStyles} from './styles';
import {Tooltip} from './tooltip';

interface ButtonInnerStyles {
  styles?: StatefulStyles;
  content?: string;
}

export interface ButtonStyles {
  container?: StatefulStyles;
  svg?: ButtonInnerStyles;
  text?: ButtonInnerStyles;
}

export type ButtonPosition = 'inside-start' | 'inside-end' | 'outside-start' | 'outside-end' | 'dropup-menu';

export interface Button {
  styles?: ButtonStyles;
  position?: ButtonPosition;
  tooltip?: true | Tooltip;
}
