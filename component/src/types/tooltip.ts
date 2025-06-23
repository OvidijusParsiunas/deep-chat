export interface Tooltip {
  text?: string;
  timeout?: number;
}

export interface ActiveTooltip {
  timeout: number;
  element: HTMLElement;
}
