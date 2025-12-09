import {StatefulStyles} from './styles';

export interface ScrollButton {
  styles?: StatefulStyles;
  smoothScroll?: boolean;
  scrollDelta?: number;
  content?: string;
}

export interface HiddenMessages {
  styles?: StatefulStyles;
  smoothScroll?: boolean;
  clickScroll?: 'first' | 'last';
  onUpdate?: (content: string, number: number) => string;
}
