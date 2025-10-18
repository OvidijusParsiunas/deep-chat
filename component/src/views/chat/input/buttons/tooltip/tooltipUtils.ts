import {CLASS_LIST, CREATE_ELEMENT, STYLE} from '../../../../../utils/consts/htmlConstants';
import {ActiveTooltip, Tooltip} from '../../../../../types/tooltip';
import {StyleUtils} from '../../../../../utils/element/styleUtils';
import {TEXT} from '../../../../../utils/consts/messageConstants';

export class TooltipUtils {
  private static readonly OVERFLOW_NEW_POSITION_PX = 4;

  public static buildElement() {
    const container = CREATE_ELEMENT();
    container[CLASS_LIST].add('tooltip');
    const text = CREATE_ELEMENT('span');
    text[CLASS_LIST].add('tooltip-text');
    container.appendChild(text);
    return container;
  }

  public static tryCreateConfig(defaultText: string, tooltip?: true | Tooltip): Tooltip | undefined {
    if (!tooltip) return undefined;
    if (typeof tooltip === 'boolean') return {[TEXT]: defaultText};
    return {
      [TEXT]: tooltip[TEXT] || defaultText,
      timeout: tooltip.timeout || 0,
      style: tooltip[STYLE],
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
    tooltipElement[STYLE].left = `${buttonMiddle - tooltipHalf - shadowRect.left}px`;
    tooltipElement[STYLE].top = `${buttonRect.top - 36 - shadowRect.top}px`;
    const tooltipRect = tooltipElement.getBoundingClientRect();
    if (tooltipRect.left < shadowRect.left) {
      tooltipElement[STYLE].left = `${TooltipUtils.OVERFLOW_NEW_POSITION_PX}px`;
    } else if (tooltipRect.right > shadowRect.right) {
      tooltipElement[STYLE].left = `${shadowRect.width - tooltipRect.width - TooltipUtils.OVERFLOW_NEW_POSITION_PX}px`;
    }
  }

  public static display(buttonElement: HTMLElement, config: Tooltip, tooltipElement?: HTMLElement) {
    if (!tooltipElement) {
      const containerElement = TooltipUtils.traverseParentUntilContainer(buttonElement);
      tooltipElement = containerElement.nextSibling as HTMLElement;
    }
    if (config[TEXT]) tooltipElement.children[0].textContent = config[TEXT];
    const timeout = setTimeout(() => {
      tooltipElement[STYLE].visibility = 'visible';
      TooltipUtils.setPosition(buttonElement, tooltipElement);
      if (config[STYLE]) Object.assign(tooltipElement[STYLE], config[STYLE]);
    }, config.timeout || 0);
    return {timeout, element: tooltipElement};
  }

  public static hide(activeTooltip: ActiveTooltip, config: Tooltip) {
    clearTimeout(activeTooltip.timeout);
    activeTooltip.element[STYLE].visibility = 'hidden';
    if (config[STYLE]) StyleUtils.unsetStyle(activeTooltip.element, config[STYLE]);
    activeTooltip.element[STYLE].left = '';
    activeTooltip.element[STYLE].top = '';
  }
}
