import {CREATE_ELEMENT} from '../consts/htmlConstants';
import {CustomStyle} from '../../types/styles';

export class WebComponentStyleUtils {
  public static apply(style: string, shadowRoot: ShadowRoot | null) {
    if (!shadowRoot) return;
    try {
      WebComponentStyleUtils.applyStyleSheet(style, shadowRoot);
    } catch (_) {
      // fallback for if CSSStyleSheet is not supported (Safari)
      WebComponentStyleUtils.addStyleElement(style, shadowRoot);
    }
  }

  private static applyStyleSheet(style: string, shadowRoot: ShadowRoot) {
    const styleSheet = new CSSStyleSheet();
    styleSheet.replaceSync(style);
    shadowRoot.adoptedStyleSheets.push(styleSheet);
  }

  private static addStyleElement(style: string, shadowRoot: ShadowRoot) {
    const stylesDocument = CREATE_ELEMENT('style') as HTMLStyleElement;
    stylesDocument.innerHTML = style;
    shadowRoot.appendChild(stylesDocument);
  }

  private static camelToKebab(str: string): string {
    return str.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
  }

  public static applyChatStyle(chatStyle: CustomStyle | undefined, shadowRoot: ShadowRoot | null) {
    if (!chatStyle || !shadowRoot) return;
    const declarations = Object.entries(chatStyle)
      .filter(([, value]) => value)
      .map(([key, value]) => `${WebComponentStyleUtils.camelToKebab(key)}: ${value};`)
      .join(' ');
    if (declarations) {
      WebComponentStyleUtils.apply(`:host { ${declarations} }`, shadowRoot);
    }
  }
}
