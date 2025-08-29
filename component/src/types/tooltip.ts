import {CustomStyle} from './styles';

export interface Tooltip {
  text?: string;
  timeout?: number;
  style?: CustomStyle;
}

export interface ActiveTooltip {
  timeout: number;
  element: HTMLElement;
}
