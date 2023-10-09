class CustomElement extends HTMLElement {
  constructor() {
    super();
    this.textContent = 'This is a Custom Element';
  }
}

export function add() {
  if (!customElements.get('custom-element')) {
    customElements.define('custom-element', CustomElement);
  }
}
