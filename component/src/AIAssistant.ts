import {CustomMessageStyles, ErrorMessages, MessageContent, OnNewMessage} from './types/messages';
import {WebComponentStyleUtils} from './utils/webComponent/webComponentStyleUtils';
import {InternalHTML} from './utils/webComponent/internalHTML';
import {InsertKeyView} from './views/insertKey/insertKeyView';
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
  @Property('string')
  apiKey?: string;

  @Property('object')
  openAI?: OpenAI;

  @Property('boolean')
  startWithChatView?: boolean;

  @Property('object')
  requestSettings?: RequestSettings;

  // WORK - when this is set input class should be set to -5px
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
  errorMessage?: ErrorMessages;

  @Property('function')
  onNewMessage?: OnNewMessage;

  submitUserMessage: (text: string) => void = () =>
    console.warn('submitUserMessage failed - please wait for chat view to render before calling this property.');

  // TO-DO - key view style
  // TO-DO - getMessages()

  constructor() {
    super();
    this._elementRef = document.createElement('div');
    this._elementRef.id = 'container';
    this.attachShadow({mode: 'open'}).appendChild(this._elementRef);
    WebComponentStyleUtils.apply(style, this.shadowRoot, this._elementRef);
    InsertKeyView.render(this._elementRef, this.changeToChatView.bind(this));
  }

  private readonly _elementRef: HTMLElement;

  private changeToChatView(newKey: string) {
    this.apiKey = newKey;
    this.onRender();
  }

  override onRender() {
    console.log('render');
    Object.assign(this._elementRef.style, this.containerStyle);
    if (this.startWithChatView || this.apiKey) {
      ChatView.render(this._elementRef, this.apiKey || '', this);
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
