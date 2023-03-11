import {CustomStyle, StatefulStyle} from '../../types/styles';
import {GenericObject} from '../../types/object';

export class StyleUtils {
  public static unsetStyle(element: HTMLElement, style: CustomStyle) {
    const unsetStyles = Object.keys(style).reduce<GenericObject>((obj, styleName) => {
      obj[styleName] = '';
      return obj;
    }, {});
    Object.assign(element.style, unsetStyles);
  }

  public static unsetAllCSSMouseStates(element: HTMLElement, statefulStyle: StatefulStyle) {
    if (statefulStyle.click) StyleUtils.unsetStyle(element, statefulStyle.click);
    if (statefulStyle.hover) StyleUtils.unsetStyle(element, statefulStyle.hover);
    if (statefulStyle.default) StyleUtils.unsetStyle(element, statefulStyle.default);
  }
}
