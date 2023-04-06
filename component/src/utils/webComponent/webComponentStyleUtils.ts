export class WebComponentStyleUtils {
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
}
