import {CustomStyle, StatefulStyles} from './styles';
import {ButtonElementStyles} from './button';

export interface DropupMenuStyles {
  container?: CustomStyle;
  item?: StatefulStyles;
  iconContainer?: CustomStyle;
  text?: CustomStyle;
}

export interface DropupStyles {
  button?: ButtonElementStyles;
  menu?: DropupMenuStyles;
}
