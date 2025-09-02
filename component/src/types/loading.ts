import {LoadingStyles} from './messages';

export type LoadingToggleConfig = {style?: LoadingStyles; role?: string};

export type DisplayLoadingBubble = boolean | {toggle: (config?: LoadingToggleConfig) => void};
