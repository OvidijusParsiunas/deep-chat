import {StatefulStyle} from './styles';

interface SubmitButtonInnerElementStyle {
  style?: StatefulStyle;
  string?: string;
}

export interface SubmitButtonElementsStyle {
  container?: StatefulStyle;
  svg?: SubmitButtonInnerElementStyle;
  text?: SubmitButtonInnerElementStyle;
}

export interface SubmitButtonStyles {
  submit?: SubmitButtonElementsStyle;
  loading?: SubmitButtonElementsStyle;
  stop?: SubmitButtonElementsStyle;
}

export type SubmitButtonInnerElement = HTMLElement | SVGGraphicsElement;

export interface SubmitButtonInnerElements {
  submit: SubmitButtonInnerElement;
  loading: SubmitButtonInnerElement;
  stop: SubmitButtonInnerElement;
}
