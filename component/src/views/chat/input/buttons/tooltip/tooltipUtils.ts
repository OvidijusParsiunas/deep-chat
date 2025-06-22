import {ActiveTooltip, Tooltip} from '../../../../../types/tooltip';

export class TooltipUtils {
  public static buildElement() {
    const container = document.createElement('div');
    container.classList.add('tooltip');
    container.classList.add('tooltip-top');
    const text = document.createElement('span');
    text.classList.add('tooltip-text');
    container.appendChild(text);
    return container;
  }

  public static tryCreateConfig(defaultText: string, tooltip?: true | Tooltip): Tooltip | undefined {
    if (!tooltip) return undefined;
    if (typeof tooltip === 'boolean') return {text: defaultText, position: 'bottom'};
    return {
      text: tooltip.text || defaultText,
      position: tooltip.position || 'bottom',
      timeout: tooltip.timeout || 0,
    };
  }

  private static traverseParentUntilContainer(element: HTMLElement) {
    let currentElement = element;
    while (currentElement.parentElement) {
      currentElement = currentElement.parentElement;
    }
    return currentElement;
  }

  public static display(buttonElement: HTMLElement, config: Tooltip, element?: HTMLElement) {
    if (!element) {
      const containerElement = TooltipUtils.traverseParentUntilContainer(buttonElement);
      element = containerElement.nextSibling as HTMLElement;
    }
    const shadowElement = (element.getRootNode() as ShadowRoot).host;
    const timeout = setTimeout(() => {
      if (element instanceof HTMLElement) {
        element.style.visibility = 'visible';
        const shadowRect = shadowElement.getBoundingClientRect();
        const buttonRect = buttonElement.getBoundingClientRect();
        element.style.left = `${buttonRect.left - 20 - shadowRect.left}px`;
        element.style.top = `${buttonRect.top - 30 - shadowRect.top}px`;
        const tooltipRect = element.getBoundingClientRect();
        if (tooltipRect.left < shadowRect.left) {
          element.style.left = '4px';
        } else if (tooltipRect.right > shadowRect.right) {
          element.style.left = `${shadowRect.width - tooltipRect.width - 4}px`;
        }
      }
    }, config.timeout || 0);
    return {timeout, element};
  }

  public static hide(activeTooltip: ActiveTooltip) {
    clearTimeout(activeTooltip.timeout);
    activeTooltip.element.style.visibility = 'hidden';
  }
}
