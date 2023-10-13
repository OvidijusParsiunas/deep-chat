import {CustomStyle, StatefulStyles} from '../../types/styles';
import {GenericObject} from '../../types/object';

export class StyleUtils {
  public static unsetStyle(element: HTMLElement, style: CustomStyle) {
    const unsetStyles = Object.keys(style).reduce<GenericObject>((obj, styleName) => {
      obj[styleName] = '';
      return obj;
    }, {});
    Object.assign(element.style, unsetStyles);
  }

  public static unsetActivityCSSMouseStates(element: HTMLElement, statefulStyle: StatefulStyles) {
    if (statefulStyle.click) StyleUtils.unsetStyle(element, statefulStyle.click);
    if (statefulStyle.hover) StyleUtils.unsetStyle(element, statefulStyle.hover);
  }

  public static unsetAllCSSMouseStates(element: HTMLElement, statefulStyle: StatefulStyles) {
    StyleUtils.unsetActivityCSSMouseStates(element, statefulStyle);
    if (statefulStyle.default) StyleUtils.unsetStyle(element, statefulStyle.default);
  }

  public static processStateful(styles: StatefulStyles, defHover: CustomStyle, defClick: CustomStyle): StatefulStyles {
    const defaultStyle = styles.default || {};
    const hoverStyle = Object.assign(JSON.parse(JSON.stringify({...defaultStyle, ...defHover})), styles?.hover);
    const clickStyle = Object.assign(JSON.parse(JSON.stringify({...hoverStyle, ...defClick})), styles?.click);
    return {default: defaultStyle, hover: hoverStyle, click: clickStyle};
  }

  public static mergeStatefulStyles(stylesArr: StatefulStyles[]): StatefulStyles {
    const statefulStyles = {default: {}, hover: {}, click: {}};
    stylesArr.forEach((styles) => {
      statefulStyles.default = Object.assign(statefulStyles.default, styles.default);
      statefulStyles.hover = Object.assign(statefulStyles.hover, styles.hover);
      statefulStyles.click = Object.assign(statefulStyles.click, styles.click);
    });
    return statefulStyles;
  }

  public static overwriteDefaultWithAlreadyApplied(styles: StatefulStyles, element: HTMLElement) {
    Object.keys(styles.default || []).forEach((key) => {
      const styleKey = key as keyof CSSStyleDeclaration;
      if (element.style[styleKey]) {
        if (styles.default?.[styleKey]) {
          (styles.default as GenericObject)[key] = element.style[styleKey] as string;
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
