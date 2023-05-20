import {MessageStyles, ErrorMessageOverrides, MessageContent, OnNewMessage} from './types/messages';
import {ValidateKeyPropertyView} from './views/validateKeyProperty/validateKeyPropertyView';
import {WebComponentStyleUtils} from './utils/webComponent/webComponentStyleUtils';
import {ValidateMessageBeforeSending} from './types/validateMessageBeforeSending';
import {FocusUtils} from './views/chat/input/textInput/focusUtils';
import {InternalHTML} from './utils/webComponent/internalHTML';
import {InsertKeyView} from './views/insertKey/insertKeyView';
import {ServiceIOFactory} from './services/serviceIOFactory';
import {GoogleFont} from './utils/webComponent/googleFont';
import {SubmitButtonStyles} from './types/submitButton';
import {Property} from './utils/decorators/property';
import {DropupStyles} from './types/dropupStyles';
import {ChatView} from './views/chat/chatView';
import {ServiceIO} from './services/serviceIO';
import {Microphone} from './types/microphone';
import style from './AiAssistant.css?inline';
import {TextInput} from './types/textInput';
import {CustomStyle} from './types/styles';
import {Service} from './types/service';
import {Avatars} from './types/avatars';
import {Names} from './types/names';

// TO-DO - ability to export files
// TO-DO - perhaps chat bubbles should start at the bottom which would allow nice slide up animation (optional)
export class AiAssistant extends InternalHTML {
  // can only be used if serviceKey has been set via the key property
  @Property('boolean')
  validateKeyProperty?: boolean;

  @Property('object')
  service?: Service;

  @Property('object')
  attachmentContainerStyle?: CustomStyle;

  @Property('object')
  dragAndDrop?: boolean | CustomStyle; // by default it is enabled if file attachments are allowed

  @Property('object')
  speechToTextInput?: Microphone = true; // only activated if not used by recording for audio

  @Property('boolean')
  speechOutput?: boolean;

  @Property('object')
  containerStyle?: CustomStyle;

  @Property('object')
  dropupStyles?: DropupStyles;

  @Property('object')
  textInput?: TextInput;

  @Property('object')
  inputAreaStyle?: CustomStyle;

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
  displayLoadingBubble?: boolean;

  @Property('string')
  auxiliaryStyle?: string;

  @Property('function')
  onNewMessage?: OnNewMessage;

  @Property('function')
  onComponentRender?: () => void = () => {};

  @Property('function')
  validateMessageBeforeSending?: ValidateMessageBeforeSending;

  focusInput: () => void = () => {
    FocusUtils.focusFromParentElement(this._elementRef);
  };

  getMessages: () => MessageContent[] = () => [];

  // will need to add an example for this
  submitUserMessage: (userText: string, files?: File[]) => void = () =>
    console.warn('submitUserMessage failed - please wait for chat view to render before calling this property.');

  _isSlotPopulated = false;

  _hasBeenRendered = false;

  _auxiliaryStyleApplied = false;

  _activeService?: ServiceIO;

  // TO-DO - key view style

  constructor() {
    super();
    GoogleFont.appendStyleSheetToHead();
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

  private changeToChatView() {
    if (this._activeService) this._activeService.validateConfigKey = false;
    this.onRender();
  }

  override onRender() {
    // TO-DO - this will be moved to service selection view
    this._activeService ??= ServiceIOFactory.create(this, this._elementRef);
    if (!this._activeService) return;
    if (this.auxiliaryStyle && !this._auxiliaryStyleApplied) {
      WebComponentStyleUtils.apply(this.auxiliaryStyle, this.shadowRoot);
      this._auxiliaryStyleApplied = true;
    }
    Object.assign(this._elementRef.style, this.containerStyle);
    if (this._activeService.key && this._activeService.validateConfigKey) {
      ValidateKeyPropertyView.render(this._elementRef, this.changeToChatView.bind(this), this._activeService);
    } else if (this._activeService.key || this.service?.custom) {
      ChatView.render(this, this._elementRef, this._activeService);
    } else {
      // the reason why this is not initiated in the constructor is because properties/attributes are not available
      // when it is executed, meaning that if the user sets customService or key, this would first ppear and
      // then the chatview would be rendered after it, which causes a blink and is bad UX
      InsertKeyView.render(this._elementRef, this.changeToChatView.bind(this), this._activeService);
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
