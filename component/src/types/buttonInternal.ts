import {ButtonElementStyles} from './button';
import {OverrideTypes} from './utilityTypes';

export type ButtonInnerElement = HTMLElement | SVGGraphicsElement;

export type ButtonInnerElements<T> = {
  [P in keyof T]?: ButtonInnerElement;
};

export type ButtonStateStyles<T> = {
  [P in keyof T]: ButtonElementStyles;
};

export type DefinedButtonStateStyles<T extends object> = Omit<T, 'position'>;

export type DefinedButtonInnerElements<T extends object> = Required<
  OverrideTypes<Omit<T, 'position'>, ButtonInnerElement>
>;
