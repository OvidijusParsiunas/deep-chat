import {StyleUtils} from '../element/styleUtils';

export class WebComponentStyleUtils {
  private static readonly DEFAULT_COMPONENT_STYLE = {
    height: '350px',
    width: '320px',
    border: '1px solid #cacaca',
    fontFamily: `'Inter', sans-serif, Avenir, Helvetica, Arial`,
    fontSize: '0.9rem',
    backgroundColor: 'white',
    position: 'relative',
    overflow: 'hidden',
  };

  public static apply(style: string, shadowRoot: ShadowRoot | null) {
    if (!shadowRoot) return;
    try {
      WebComponentStyleUtils.applyStyleSheet(style, shadowRoot);
    } catch (err) {
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
    const stylesDocument = document.createElement('style');
    stylesDocument.innerHTML = style;
    shadowRoot.appendChild(stylesDocument);
  }

  public static applyDefaultStyleToComponent(style: CSSStyleDeclaration) {
    StyleUtils.applyToStyleIfNotDefined(style, WebComponentStyleUtils.DEFAULT_COMPONENT_STYLE);
  }
}
