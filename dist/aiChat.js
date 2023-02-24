import { ChatView } from './views/chat/chatView';
import { aiChatStyle } from './aiChatStyle';
const insertKeyView = document.createElement('template');
insertKeyView.innerHTML = `
  <div>
    Insert key:
    <input></input><button>Submit</button>
  </div>
`;
const defaultTemplate = document.createElement('template');
defaultTemplate.innerHTML = `
  ${aiChatStyle}
  <div id="ai-chat-container"></div>
`;
export class AiChat extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' }).appendChild(defaultTemplate.content.cloneNode(true));
        this._containerRef = this.shadowRoot.getElementById('ai-chat-container');
        this._containerRef.appendChild(insertKeyView.content.cloneNode(true));
    }
    // getter and setter needed for property change monitoring
    get key() {
        return this.key;
    }
    set key(newValue) {
        console.log('key has changed!');
        new ChatView(this._containerRef, newValue);
    }
    static get observedAttributes() {
        return ['key'];
    }
    attributeChangedCallback(property, oldValue, newValue) {
        if (oldValue === newValue)
            return;
        if (property === 'key')
            this.key = newValue;
    }
}
customElements.define('ai-chat', AiChat);
//# sourceMappingURL=aiChat.js.map