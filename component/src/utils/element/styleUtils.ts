import {CustomStyle, StatefulStyles} from '../../types/styles';
import {CLICK, DEFAULT, HOVER} from '../consts/inputConstants';
import {GenericObject} from '../../types/object';
import {STYLE} from '../consts/htmlConstants';

export class StyleUtils {
  public static unsetStyle(element: HTMLElement, style: CustomStyle) {
    const unsetStyles = Object.keys(style).reduce<GenericObject>((obj, styleName) => {
      obj[styleName] = '';
      return obj;
    }, {});
    Object.assign(element[STYLE], unsetStyles);
  }

  public static unsetActivityCSSMouseStates(element: HTMLElement, statefulStyle: StatefulStyles) {
    if (statefulStyle[CLICK]) StyleUtils.unsetStyle(element, statefulStyle[CLICK]);
    if (statefulStyle[HOVER]) StyleUtils.unsetStyle(element, statefulStyle[HOVER]);
  }

  public static unsetAllCSSMouseStates(element: HTMLElement, statefulStyle: StatefulStyles) {
    StyleUtils.unsetActivityCSSMouseStates(element, statefulStyle);
    if (statefulStyle[DEFAULT]) StyleUtils.unsetStyle(element, statefulStyle[DEFAULT]);
  }

  // if you want to asdd default styling - use pure css classes
  public static processStateful(styles: StatefulStyles): StatefulStyles {
    const defaultStyle = styles[DEFAULT] || {};
    const hoverStyle = Object.assign(JSON.parse(JSON.stringify(defaultStyle)), styles?.[HOVER]);
    const clickStyle = Object.assign(JSON.parse(JSON.stringify(hoverStyle)), styles?.[CLICK]);
    return {[DEFAULT]: defaultStyle, [HOVER]: hoverStyle, [CLICK]: clickStyle};
  }

  public static mergeStatefulStyles(stylesArr: StatefulStyles[]): StatefulStyles {
    const statefulStyles = {[DEFAULT]: {}, [HOVER]: {}, [CLICK]: {}};
    stylesArr.forEach((styles) => {
      statefulStyles[DEFAULT] = Object.assign(statefulStyles[DEFAULT], styles[DEFAULT]);
      statefulStyles[HOVER] = Object.assign(statefulStyles[HOVER], styles[HOVER]);
      statefulStyles[CLICK] = Object.assign(statefulStyles[CLICK], styles[CLICK]);
    });
    return statefulStyles;
  }

  public static overwriteDefaultWithAlreadyApplied(styles: StatefulStyles, element: HTMLElement) {
    Object.keys(styles[DEFAULT] || []).forEach((key) => {
      const styleKey = key as keyof CSSStyleDeclaration;
      if (element[STYLE][styleKey]) {
        if (styles[DEFAULT]?.[styleKey]) {
          (styles[DEFAULT] as GenericObject)[key] = element[STYLE][styleKey] as string;
        }
      }
    });
  }

  public static applyToStyleIfNotDefined(cssDeclaration: CSSStyleDeclaration, source: CustomStyle) {
    for (const key in source) {
      const value = source[key];
      if (cssDeclaration[key] === '' && value) cssDeclaration[key] = value;
    }
  }
}
