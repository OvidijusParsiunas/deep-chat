import {StatefulStyles} from './styles';

export type EventToFunction = {
  [K in keyof GlobalEventHandlersEventMap]?: (event: GlobalEventHandlersEventMap[K]) => void;
} & {[eventName: string]: (event: CustomEvent) => void};

export interface HTMLClassUtility {
  events?: EventToFunction;
  styles?: StatefulStyles;
}

export type HTMLClassUtilities = {
  [className: string]: HTMLClassUtility;
};
