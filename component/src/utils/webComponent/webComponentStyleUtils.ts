import {StyleUtils} from '../element/styleUtils';
import {CustomStyle} from '../../types/styles';
import {GoogleFont} from './googleFont';

export class WebComponentStyleUtils {
  private static readonly DEFAULT_COMPONENT_STYLE: Partial<CSSStyleDeclaration> = {
    height: '350px',
    width: '320px',
    border: '1px solid #cacaca',
    fontFamily: GoogleFont.DEFAULT_FONT_FAMILY,
    fontSize: '0.9rem',
    backgroundColor: 'white',
    position: 'relative',
    // this is used to prevent inputAreaStyle background color from going beyond the container's rounded border
    // it will cause issues if there are elements that are meant to be outside of the chat component and in
    // that instance they should overwrite this
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

  public static applyDefaultStyleToComponent(style: CSSStyleDeclaration, chatStyle?: CustomStyle) {
    if (chatStyle) StyleUtils.applyToStyleIfNotDefined(style, chatStyle);
    StyleUtils.applyToStyleIfNotDefined(style, WebComponentStyleUtils.DEFAULT_COMPONENT_STYLE);
  }
}
