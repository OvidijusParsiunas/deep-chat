import {CustomMessageStyles, ErrorMessage, MessageContent, OnNewMessage} from './types/messages';
import {InternalHTML} from './utils/webComponent/internalHTML';
import {InsertKeyView} from './views/insertKey/insertKeyView';
import {StyleUtil} from './utils/webComponent/styleUtil';
import {RequestSettings} from './types/requestSettings';
import {SubmitButtonStyles} from './types/submitButton';
import {Property} from './utils/decorators/property';
import {SpeechInput} from './types/speechInput';
import {ChatView} from './views/chat/chatView';
import style from './AiAssistant.css?inline';
import {CustomStyle} from './types/styles';
import {InputStyles} from './types/input';
import {Avatars} from './types/avatar';
import {OpenAI} from './types/openAI';
import {Names} from './types/names';

export class AiAssistant extends InternalHTML {
  private readonly _elementRef: HTMLElement;

  @Property('string')
  key?: string;

  @Property('object')
  openAI?: OpenAI;

  @Property('boolean')
  startWithChatView?: boolean;

  @Property('object')
  requestSettings?: RequestSettings;

  @Property('boolean')
  speechInput?: SpeechInput;

  @Property('boolean')
  speechOutput?: boolean;

  @Property('object')
  containerStyle?: CustomStyle;

  @Property('object')
  inputStyles?: InputStyles;

  @Property('object')
  submitButtonStyles?: SubmitButtonStyles;

  @Property('object')
  messageStyles?: CustomMessageStyles;

  @Property('object')
  avatars?: Avatars;

  @Property('object')
  names?: Names;

  @Property('object')
  startMessages?: MessageContent[];

  @Property('object')
  errorMessage?: ErrorMessage;

  @Property('function')
  onNewMessage?: OnNewMessage;

  submitUserMessage: (text: string) => void = () =>
    console.warn('submitUserMessage failed - please wait for chat view to render before calling this property.');

  constructor() {
    super();
    this._elementRef = AiAssistant.createContainerElement();
    this.attachShadow({mode: 'open'}).appendChild(this._elementRef);
    StyleUtil.apply(style, this.shadowRoot, this._elementRef);
    Object.assign(this._elementRef.style, this.containerStyle);
    InsertKeyView.render(this._elementRef, this.changeToChatView.bind(this));
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
    if (this.startWithChatView || this.key) {
      ChatView.render(this._elementRef, this.key || '', this);
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
