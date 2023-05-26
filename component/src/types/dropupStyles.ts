import {CustomStyle, StatefulStyles} from './styles';
import {GenericButton} from './button';

export interface DropupMenuStyles {
  container?: CustomStyle;
  item?: StatefulStyles;
  iconContainer?: CustomStyle;
  text?: CustomStyle;
}

export interface DropupStyles {
  button?: GenericButton;
  menu?: DropupMenuStyles;
}
