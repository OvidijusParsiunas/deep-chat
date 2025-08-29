export class GoogleFont {
  private static readonly FONT_URL = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap';
  public static readonly DEFAULT_FONT_FAMILY = `'Inter', sans-serif, Avenir, Helvetica, Arial`;

  public static attemptAppendStyleSheetToHead(cssStyle: CSSStyleDeclaration) {
    if (cssStyle.fontFamily && cssStyle.fontFamily !== GoogleFont.DEFAULT_FONT_FAMILY) return;
    const head = document.getElementsByTagName('head')[0];
    const linkExists = Array.from(head.getElementsByTagName('link')).some(
      (link) => link.getAttribute('href') === GoogleFont.FONT_URL
    );
    if (!linkExists) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = GoogleFont.FONT_URL;
      head.appendChild(link);
    }
  }
}
