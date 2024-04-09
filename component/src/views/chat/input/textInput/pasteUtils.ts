export class PasteUtils {
  public static sanitizePastedTextContent(event: ClipboardEvent) {
    event.preventDefault();
    const text = event.clipboardData?.getData('text/plain');
    if (text) document.execCommand?.('insertText', false, text);
  }
}
