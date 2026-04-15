export class PasteUtils {
  public static sanitizePastedTextContent(event: ClipboardEvent) {
    event.preventDefault();
    const text = event.clipboardData?.getData('text/plain');
    if (!text) return;
    // Escape HTML entities and convert newlines to <br>
    const html = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
    document.execCommand('insertHTML', false, html);
  }
}
