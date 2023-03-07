import {SubmitButtonStyles} from './submitButton';

export type SubmitButtonInnerElement = HTMLElement | SVGGraphicsElement;

export interface SubmitButtonInnerElements {
  submit: SubmitButtonInnerElement;
  loading: SubmitButtonInnerElement;
  stop: SubmitButtonInnerElement;
}

export type SubmitButtonElStyles = Omit<SubmitButtonStyles, 'position'>;
