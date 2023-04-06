import {CustomMessageStyles, ErrorMessages, MessageContent, OnNewMessage} from './types/messages';
import {WebComponentStyleUtils} from './utils/webComponent/webComponentStyleUtils';
import {FocusUtils} from './views/chat/input/keyboardInput/focusUtils';
import {InternalHTML} from './utils/webComponent/internalHTML';
import {InsertKeyView} from './views/insertKey/insertKeyView';
import {RequestInterceptor} from './types/requestInterceptor';
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

// WORK - introductory message
// WORK - custom model - not chatgpt
// WORK - rename this file to aiAssistant.ts in github
// WORK - handle code indentation messages
// WORK - handle images
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

  @Property('number')
  inputCharacterLimit?: number;

  @Property('object')
  submitButtonStyles?: SubmitButtonStyles;

  @Property('object')
  messageStyles?: CustomMessageStyles;

  @Property('object')
  avatars?: Avatars;

  @Property('object')
  names?: Names;

  @Property('object')
  initMessages?: MessageContent[];

  @Property('object')
  errorMessage?: ErrorMessages;

  @Property('string')
  context?: string;

  @Property('function')
  requestInterceptor?: RequestInterceptor;

  @Property('function')
  onNewMessage?: OnNewMessage;

  @Property('string')
  additionalStyle?: string;

  focusInput: () => void = () => {
    if (ChatView.shouldBeRendered(this)) FocusUtils.focusFromParentElement(this._elementRef);
  };

  submitUserMessage: (text: string) => void = () =>
    console.warn('submitUserMessage failed - please wait for chat view to render before calling this property.');

  _hasBeenRendered = false;

  _additionalStyleApplied = false;

  // TO-DO - key view style
  // TO-DO - getMessages()

  constructor() {
    super();
    this._elementRef = document.createElement('div');
    this._elementRef.id = 'container';
    this.attachShadow({mode: 'open'}).appendChild(this._elementRef);
    WebComponentStyleUtils.apply(style, this.shadowRoot);
    setTimeout(() => {
      // if user has not set anything (to cause onRender to execute), force it
      // this.initMessages is a safety measure so that events are definitely not fired twice
      if (!this._hasBeenRendered && !this.initMessages) {
        this.onRender();
      }
    }, 20); // rendering takes time, hence this is a high value to be safe
  }

  private readonly _elementRef: HTMLElement;

  private changeToChatView(newKey: string) {
    this.apiKey = newKey;
    this.onRender();
  }

  override onRender() {
    if (this.additionalStyle && !this._additionalStyleApplied) {
      WebComponentStyleUtils.apply(this.additionalStyle, this.shadowRoot);
      this._additionalStyleApplied = true;
    }
    Object.assign(this._elementRef.style, this.containerStyle);
    if (ChatView.shouldBeRendered(this)) {
      ChatView.render(this._elementRef, this.apiKey || '', this);
    } else {
      // the reason why this is not initiated in the constructor is because properties/attributes are not available
      // when it is executed, meaning that if the user sets startWithChatView or apiKey to true, this would first
      // appear and then then the chatview would be rendered after it, which causes a blink and is bad UX
      InsertKeyView.render(this._elementRef, this.changeToChatView.bind(this));
    }
    this._hasBeenRendered = true;
  }
}

customElements.define('ai-assistant', AiAssistant);

// The following type makes it easier for other projects to use this component with TypeScript
declare global {
  interface HTMLElementTagNameMap {
    'ai-assistant': AiAssistant;
  }
}
