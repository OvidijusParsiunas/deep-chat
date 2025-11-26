import {StatefulStyles} from './styles';

export interface HiddenMessages {
  styles?: StatefulStyles;
  onUpdate?: (content: string, number: number) => string;
  clickScroll?: 'first' | 'last';
}
