import {ChatView} from './views/chat/chatView';
import style from './realAI.css?inline';

const insertKeyView = document.createElement('template');
insertKeyView.innerHTML = `
  <div>
    Insert key:
    <input></input><button>Submit</button>
  </div>
`;

export class RealAI extends HTMLElement {
  _elementRefRef: HTMLElement;

  constructor() {
    super();
    this._elementRefRef = RealAI.createContainerElement();
    this.attachShadow({mode: 'open'}).appendChild(this._elementRefRef);
    this.appendStyleSheet();
    this._elementRefRef.appendChild(insertKeyView.content.cloneNode(true));
  }

  private appendStyleSheet() {
    const styleSheet = new CSSStyleSheet();
    styleSheet.replaceSync(style);
    this.shadowRoot!.adoptedStyleSheets = [styleSheet];
  }

  private static createContainerElement() {
    const container = document.createElement('div');
    container.id = 'real-ai-container';
    return container;
  }

  // getter and setter needed for property change monitoring
  get key(): string {
    return this.key;
  }

  set key(newValue) {
    console.log('key has changed!');
    new ChatView(this._elementRefRef, newValue);
  }

  static get observedAttributes() {
    return ['key'];
  }

  attributeChangedCallback(property: string, oldValue: string, newValue: string) {
    if (oldValue === newValue) return;
    if (property === 'key') this.key = newValue;
  }
}

customElements.define('real-ai', RealAI);

// The following type makes it easier for other projects to use this component with TypeScript
declare global {
  interface HTMLElementTagNameMap {
    'real-ai': RealAI;
  }
}
