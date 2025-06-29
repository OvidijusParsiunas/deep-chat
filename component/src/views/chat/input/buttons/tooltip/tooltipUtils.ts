import {ActiveTooltip, Tooltip} from '../../../../../types/tooltip';
import {StyleUtils} from '../../../../../utils/element/styleUtils';

export class TooltipUtils {
  private static readonly OVERFLOW_NEW_POSITION_PX = 4;

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
      style: tooltip.style,
    };
  }

  private static traverseParentUntilContainer(element: HTMLElement) {
    let currentElement = element;
    while (currentElement.parentElement) {
      currentElement = currentElement.parentElement;
    }
    return currentElement;
  }

  private static setPosition(buttonElement: HTMLElement, tooltipElement: HTMLElement) {
    const shadowElement = (tooltipElement.getRootNode() as ShadowRoot).host;
    const shadowRect = shadowElement.getBoundingClientRect();
    const buttonRect = buttonElement.getBoundingClientRect();
    const tooltipRectOriginal = tooltipElement.getBoundingClientRect();
    const tooltipHalf = tooltipRectOriginal.width / 2;
    const buttonMiddle = buttonRect.left + buttonRect.width / 2;
    tooltipElement.style.left = `${buttonMiddle - tooltipHalf - shadowRect.left}px`;
    tooltipElement.style.top = `${buttonRect.top - 36 - shadowRect.top}px`;
    const tooltipRect = tooltipElement.getBoundingClientRect();
    if (tooltipRect.left < shadowRect.left) {
      tooltipElement.style.left = `${TooltipUtils.OVERFLOW_NEW_POSITION_PX}px`;
    } else if (tooltipRect.right > shadowRect.right) {
      tooltipElement.style.left = `${shadowRect.width - tooltipRect.width - TooltipUtils.OVERFLOW_NEW_POSITION_PX}px`;
    }
  }

  public static display(buttonElement: HTMLElement, config: Tooltip, tooltipElement?: HTMLElement) {
    if (!tooltipElement) {
      const containerElement = TooltipUtils.traverseParentUntilContainer(buttonElement);
      tooltipElement = containerElement.nextSibling as HTMLElement;
    }
    if (config.text) tooltipElement.children[0].textContent = config.text;
    const timeout = setTimeout(() => {
      tooltipElement.style.visibility = 'visible';
      TooltipUtils.setPosition(buttonElement, tooltipElement);
      if (config.style) Object.assign(tooltipElement.style, config.style);
    }, config.timeout || 0);
    return {timeout, element: tooltipElement};
  }

  public static hide(activeTooltip: ActiveTooltip, config: Tooltip) {
    clearTimeout(activeTooltip.timeout);
    activeTooltip.element.style.visibility = 'hidden';
    if (config.style) StyleUtils.unsetStyle(activeTooltip.element, config.style);
    activeTooltip.element.style.left = '';
    activeTooltip.element.style.top = '';
  }
}
