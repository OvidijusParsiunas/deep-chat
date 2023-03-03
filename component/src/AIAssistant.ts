import {CustomMessageStyles, StartMessages} from './types/messages';
import {InternalHTML} from './utils/webComponent/internalHTML';
import {InsertKeyView} from './views/insertKey/insertKeyView';
import {StyleUtil} from './utils/webComponent/styleUtil';
import {Property} from './utils/decorators/property';
import {ChatView} from './views/chat/chatView';
import style from './AiAssistant.css?inline';
import {CustomStyle} from './types/styles';
import {Avatars} from './types/avatar';
import {OpenAI} from './types/openAI';

export class AiAssistant extends InternalHTML {
  private readonly _elementRef: HTMLElement;

  @Property('string')
  key?: string;

  @Property('object')
  openAI?: OpenAI;

  @Property('boolean')
  speechInput?: boolean;

  @Property('boolean')
  speechOutput?: boolean;

  @Property('object')
  containerStyle?: CustomStyle;

  @Property('object')
  inputStyle?: CustomStyle;

  @Property('string')
  defaultInputText?: string;

  @Property('object')
  submitButtonStyle?: CustomStyle;

  @Property('object')
  messageStyles?: CustomMessageStyles;

  @Property('object')
  avatars?: Avatars;

  @Property('object')
  startMessages?: StartMessages;

  submitUserMessage: (text: string) => void = () =>
    console.warn('submitUserMessage failed - please wait for chat view to render before calling this property.');

  constructor() {
    super();
    this._elementRef = AiAssistant.createContainerElement();
    this.attachShadow({mode: 'open'}).appendChild(this._elementRef);
    StyleUtil.apply(style, this.shadowRoot, this._elementRef);
    InsertKeyView.render(this._elementRef, this.changeToChatView.bind(this));
    Object.assign(this._elementRef.style, this.containerStyle);
  }

  changeToChatView(newKey: string) {
    this.key = newKey;
    this.onRender();
  }

  private static createContainerElement() {
    const container = document.createElement('div');
    container.id = 'ai-assistant-container';
    return container;
  }

  override onRender() {
    console.log('render');
    if (this.key) {
      ChatView.render(this._elementRef, this.key, this);
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
