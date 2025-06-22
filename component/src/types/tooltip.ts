export interface Tooltip {
  text: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  timeout?: number;
}

export interface ActiveTooltip {
  timeout: number;
  element: HTMLElement;
}
