import {InternalHTML} from './utils/webComponent/internalHTML';
import {StyleUtil} from './utils/webComponent/styleUtil';
import {Property} from './utils/decorators/property';
import {ChatView} from './views/chat/chatView';
import style from './AIAssistant.css?inline';

const insertKeyView = document.createElement('template');
insertKeyView.innerHTML = `
  <div>
    Insert key:
    <input></input><button>Submit</button>
  </div>
`;

export class AiAssistant extends InternalHTML {
  private readonly _elementRef: HTMLElement;

  @Property('string')
  key?: string;

  @Property('boolean')
  stream?: boolean;

  constructor() {
    super();
    this._elementRef = AiAssistant.createContainerElement();
    this.attachShadow({mode: 'open'}).appendChild(this._elementRef);
    StyleUtil.apply(style, this.shadowRoot, this._elementRef);
    this._elementRef.appendChild(insertKeyView.content.cloneNode(true));
  }

  private static createContainerElement() {
    const container = document.createElement('div');
    container.id = 'ai-assistant-container';
    return container;
  }

  override onRender() {
    console.log('render');
    if (this.key) {
      ChatView.render(this._elementRef, this.key);
    }
  }
}

customElements.define('ai-assistant', AiAssistant);

// The following type makes it easier for other projects to use this component with TypeScript
declare global {
  interface HTMLElementTagNameMap {
    'ai-assistant': AiAssistant;
  }
}
