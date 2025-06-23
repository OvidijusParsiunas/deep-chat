import {ActiveTooltip, Tooltip} from '../../../../../types/tooltip';

export class TooltipUtils {
  public static buildElement() {
    const container = document.createElement('div');
    container.classList.add('tooltip');
    const text = document.createElement('span');
    text.classList.add('tooltip-text');
    container.appendChild(text);
    return container;
  }

  public static tryCreateConfig(defaultText: string, tooltip?: true | Tooltip): Tooltip | undefined {
    if (!tooltip) return undefined;
    if (typeof tooltip === 'boolean') return {text: defaultText};
    return {
      text: tooltip.text || defaultText,
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

  public static display(buttonElement: HTMLElement, config: Tooltip, tooltipElement?: HTMLElement) {
    if (!tooltipElement) {
      const containerElement = TooltipUtils.traverseParentUntilContainer(buttonElement);
      tooltipElement = containerElement.nextSibling as HTMLElement;
    }
    if (config.text) tooltipElement.children[0].textContent = config.text;
    const shadowElement = (tooltipElement.getRootNode() as ShadowRoot).host;
    const timeout = setTimeout(() => {
      if (tooltipElement instanceof HTMLElement) {
        tooltipElement.style.visibility = 'visible';
        const shadowRect = shadowElement.getBoundingClientRect();
        const buttonRect = buttonElement.getBoundingClientRect();
        const tooltipRectOriginal = tooltipElement.getBoundingClientRect();
        const tooltipHalf = tooltipRectOriginal.width / 2;
        const buttonMiddle = buttonRect.left + buttonRect.width / 2;
        tooltipElement.style.left = `${buttonMiddle - tooltipHalf - shadowRect.left}px`;
        tooltipElement.style.top = `${buttonRect.top - 36 - shadowRect.top}px`;
        const tooltipRect = tooltipElement.getBoundingClientRect();
        if (tooltipRect.left < shadowRect.left) {
          tooltipElement.style.left = '4px';
        } else if (tooltipRect.right > shadowRect.right) {
          tooltipElement.style.left = `${shadowRect.width - tooltipRect.width - 4}px`;
        }
      }
    }, config.timeout || 0);
    return {timeout, element: tooltipElement};
  }

  public static hide(activeTooltip: ActiveTooltip) {
    clearTimeout(activeTooltip.timeout);
    activeTooltip.element.style.visibility = 'hidden';
  }
}
