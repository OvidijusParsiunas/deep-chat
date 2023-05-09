import {MessageStyles, ErrorMessageOverrides, MessageContent, OnNewMessage} from './types/messages';
import {WebComponentStyleUtils} from './utils/webComponent/webComponentStyleUtils';
import {ValidateMessageBeforeSending} from './types/validateMessageBeforeSending';
import {FocusUtils} from './views/chat/input/textInput/focusUtils';
import {InternalHTML} from './utils/webComponent/internalHTML';
import {InsertKeyView} from './views/insertKey/insertKeyView';
import {ServiceIOFactory} from './services/serviceIOFactory';
import {CustomServiceConfig} from './types/customService';
import {SubmitButtonStyles} from './types/submitButton';
import {Property} from './utils/decorators/property';
import {DropupStyles} from './types/dropupStyles';
import {TextInputStyles} from './types/textInput';
import {HuggingFace} from './types/huggingFace';
import {ChatView} from './views/chat/chatView';
import {Microphone} from './types/microphone';
import {AssemblyAI} from './types/assemblyAI';
import style from './AiAssistant.css?inline';
import {CustomStyle} from './types/styles';
import {Avatars} from './types/avatar';
import {OpenAI} from './types/openAI';
import {Cohere} from './types/cohere';
import {Names} from './types/names';

// WORK - verify if the passed in key is valid and only open the chat view then
export class AiAssistant extends InternalHTML {
  @Property('string')
  apiKey?: string;

  @Property('object')
  service?: {
    openAI?: OpenAI;
    assemblyAI?: AssemblyAI;
    cohere?: Cohere;
    huggingFace?: HuggingFace;
    custom?: CustomServiceConfig;
  };

  @Property('object')
  attachmentContainerStyle?: CustomStyle;

  @Property('object')
  dragAndDrop?: boolean | CustomStyle;

  @Property('object')
  speechInput?: Microphone;

  @Property('boolean')
  speechOutput?: boolean;

  @Property('object')
  containerStyle?: CustomStyle;

  @Property('object')
  dropupStyles?: DropupStyles;

  @Property('object')
  textInputStyles?: TextInputStyles;

  @Property('number')
  inputCharacterLimit?: number;

  @Property('object')
  submitButtonStyles?: SubmitButtonStyles;

  @Property('object')
  messageStyles?: MessageStyles;

  @Property('object')
  avatars?: Avatars;

  @Property('object')
  names?: Names;

  @Property('object')
  initialMessages?: MessageContent[];

  @Property('string')
  introMessage?: string;

  @Property('object')
  introPanelStyle?: CustomStyle;

  @Property('object')
  errorMessageOverrides?: ErrorMessageOverrides;

  @Property('boolean')
  displayLoadingMessage?: boolean;

  @Property('string')
  auxiliaryStyle?: string;

  @Property('function')
  onNewMessage?: OnNewMessage;

  @Property('function')
  onComponentRender?: () => void = () => {};

  @Property('function')
  validateMessageBeforeSending?: ValidateMessageBeforeSending;

  @Property('function')
  focusInput: () => void = () => {
    if (ChatView.shouldBeRendered(this)) FocusUtils.focusFromParentElement(this._elementRef);
  };

  @Property('function')
  getMessages: () => MessageContent[] = () => [];

  // will need to add an example for this
  @Property('function')
  submitUserMessage: (userText: string, files?: File[]) => void = () =>
    console.warn('submitUserMessage failed - please wait for chat view to render before calling this property.');

  _isSlotPopulated = false;

  _hasBeenRendered = false;

  _auxiliaryStyleApplied = false;

  // TO-DO - key view style

  constructor() {
    super();
    this._isSlotPopulated = !!this.children[0];
    this._elementRef = document.createElement('div');
    this._elementRef.id = 'container';
    this.attachShadow({mode: 'open'}).appendChild(this._elementRef);
    WebComponentStyleUtils.apply(style, this.shadowRoot);
    setTimeout(() => {
      // if user has not set anything (to cause onRender to execute), force it
      if (!this._hasBeenRendered) this.onRender();
    }, 20); // rendering takes time, hence this is a high value to be safe
  }

  private readonly _elementRef: HTMLElement;

  private changeToChatView(newKey: string) {
    this.apiKey = newKey;
    this.onRender();
  }

  override onRender() {
    // TO-DO - this will be moved to service selection view
    const serviceIO = ServiceIOFactory.create(this, this.apiKey || '');
    if (this.auxiliaryStyle && !this._auxiliaryStyleApplied) {
      WebComponentStyleUtils.apply(this.auxiliaryStyle, this.shadowRoot);
      this._auxiliaryStyleApplied = true;
    }
    Object.assign(this._elementRef.style, this.containerStyle);
    if (ChatView.shouldBeRendered(this)) {
      ChatView.render(this, this._elementRef, serviceIO);
    } else {
      // the reason why this is not initiated in the constructor is because properties/attributes are not available
      // when it is executed, meaning that if the user sets customService or apiKey, this would first ppear and
      // then the chatview would be rendered after it, which causes a blink and is bad UX
      InsertKeyView.render(this._elementRef, this.changeToChatView.bind(this), serviceIO);
    }
    this._hasBeenRendered = true;
    this.onComponentRender?.();
  }
}

customElements.define('ai-assistant', AiAssistant);

// The following type makes it easier for other projects to use this component with TypeScript
declare global {
  interface HTMLElementTagNameMap {
    'ai-assistant': AiAssistant;
  }
}
