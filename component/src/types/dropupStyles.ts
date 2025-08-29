import {CustomStyle, StatefulStyles} from './styles';
import {Button} from './button';

export interface DropupMenuStyles {
  container?: CustomStyle;
  item?: StatefulStyles;
  iconContainer?: CustomStyle;
  text?: CustomStyle;
}

export interface DropupStyles {
  button?: Button;
  menu?: DropupMenuStyles;
}
