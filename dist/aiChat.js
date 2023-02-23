// import {styles} from './styles';
const chatView = document.createElement('template');
chatView.innerHTML = `
  <div>
    The key is <span id="key"><span>
  </div>
`;
const insertKeyView = document.createElement('template');
insertKeyView.innerHTML = `
  <div>Insert key:
    <input></input><button>Submit</button>
  </div>
`;
const defaultTemplate = document.createElement('template');
defaultTemplate.innerHTML = `
  <div id="ai-chat-container"></div>
`;
// template.innerHTML = `
//   ${styles}
//   <div class="text">Web component says: <span id="greeting"></span></div>
// `;
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
        this._containerRef.replaceChildren(chatView.content.cloneNode(true));
        this.shadowRoot.getElementById('key').innerText = newValue;
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