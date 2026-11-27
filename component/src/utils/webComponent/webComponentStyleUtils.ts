import {CREATE_ELEMENT} from '../consts/htmlConstants';
import {CustomStyle} from '../../types/styles';

export class WebComponentStyleUtils {
  // returns false when the style could not be applied because a nonce is required but not yet available
  public static apply(style: string, shadowRoot: ShadowRoot | null, nonce?: string, nonceRequired = false) {
    if (!shadowRoot) return true;
    try {
      WebComponentStyleUtils.applyStyleSheet(style, shadowRoot);
    } catch (_) {
      // fallback for if CSSStyleSheet is not supported (Safari)
      // <style> elements need a nonce under a strict style-src, which is only known after construction
      if (nonceRequired && !nonce) return false;
      WebComponentStyleUtils.addStyleElement(style, shadowRoot, nonce);
    }
    return true;
  }

  private static applyStyleSheet(style: string, shadowRoot: ShadowRoot) {
    const styleSheet = new CSSStyleSheet();
    styleSheet.replaceSync(style);
    shadowRoot.adoptedStyleSheets.push(styleSheet);
  }

  private static addStyleElement(style: string, shadowRoot: ShadowRoot, nonce?: string) {
    const stylesDocument = CREATE_ELEMENT('style') as HTMLStyleElement;
    if (nonce) stylesDocument.nonce = nonce;
    stylesDocument.innerHTML = style;
    shadowRoot.appendChild(stylesDocument);
  }

  private static camelToKebab(str: string): string {
    return str.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
  }

  public static applyChatStyle(chatStyle: CustomStyle | undefined, shadowRoot: ShadowRoot | null, nonce?: string) {
    if (!chatStyle || !shadowRoot) return;
    const declarations = Object.entries(chatStyle)
      .filter(([, value]) => value)
      .map(([key, value]) => `${WebComponentStyleUtils.camelToKebab(key)}: ${value};`)
      .join(' ');
    if (declarations) {
      WebComponentStyleUtils.apply(`:host { ${declarations} }`, shadowRoot, nonce);
    }
  }
}
