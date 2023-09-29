import {StatefulStyles} from './styles';

export type EventToFunction = {[K in keyof HTMLElementEventMap]?: () => void};

export type HTMLClassUtilities = {
  [className: string]: {events?: EventToFunction; styles?: StatefulStyles};
};
