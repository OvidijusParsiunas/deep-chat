import {ChatView} from './views/chat/chatView';
import {realAIStyle} from './realAIStyle';

const insertKeyView = document.createElement('template');
insertKeyView.innerHTML = `
  <div>
    Insert key:
    <input></input><button>Submit</button>
  </div>
`;

const defaultTemplate = document.createElement('template');
defaultTemplate.innerHTML = `
  ${realAIStyle}
  <div id="real-ai-container"></div>
`;

export class RealAI extends HTMLElement {
  _containerRef: HTMLElement;

  constructor() {
    super();
    this.attachShadow({mode: 'open'}).appendChild(defaultTemplate.content.cloneNode(true));
    this._containerRef = this.shadowRoot!.getElementById('real-ai-container') as HTMLElement;
    this._containerRef.appendChild(insertKeyView.content.cloneNode(true));
  }

  // getter and setter needed for property change monitoring
  get key(): string {
    return this.key;
  }

  set key(newValue) {
    console.log('key has changed!');
    new ChatView(this._containerRef, newValue);
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
