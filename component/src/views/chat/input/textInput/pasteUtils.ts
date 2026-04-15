type ShadowRootWithSelection = ShadowRoot & {getSelection?: () => Selection | null};

export class PasteUtils {
  private static createFragmentWithNewlines(text: string): DocumentFragment {
    const fragment = document.createDocumentFragment();
    const lines = text.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i]) fragment.appendChild(document.createTextNode(lines[i]));
      if (i < lines.length - 1) fragment.appendChild(document.createElement('br'));
    }
    return fragment;
  }

  public static sanitizePastedTextContent(event: ClipboardEvent) {
    event.preventDefault();
    const text = event.clipboardData?.getData('text/plain');
    if (!text) return;

    const target = event.currentTarget as HTMLElement;
    const root = target.getRootNode() as ShadowRootWithSelection;

    // Get selection from shadow root (Chromium) for shadow DOM support
    let selection: Selection | null = null;
    if (root instanceof ShadowRoot && typeof root.getSelection === 'function') {
      selection = root.getSelection();
    }

    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      const fragment = PasteUtils.createFragmentWithNewlines(text);
      const lastNode = fragment.lastChild;
      range.insertNode(fragment);
      if (lastNode) {
        range.setStartAfter(lastNode);
        range.collapse(true);
      }
      selection.removeAllRanges();
      selection.addRange(range);
    } else {
      // Fallback for browsers without shadow DOM selection support (firefox/safari)
      document.execCommand('insertText', false, text);
    }
  }
}
