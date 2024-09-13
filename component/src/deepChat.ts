import {CameraFilesServiceConfig, FilesServiceConfig, MicrophoneFilesServiceConfig} from './types/fileServiceConfigs';
import {MessageContent, IntroMessage, MessageStyles, UserContent, OnMessage} from './types/messages';
import {ValidateKeyPropertyView} from './views/validateKeyProperty/validateKeyPropertyView';
import {WebComponentStyleUtils} from './utils/webComponent/webComponentStyleUtils';
import {DisableSubmitButton, SubmitButtonStyles} from './types/submitButton';
import {RequestInterceptor, ResponseInterceptor} from './types/interceptors';
import {FocusUtils} from './views/chat/input/textInput/focusUtils';
import {DirectServiceIO} from './services/utils/directServiceIO';
import {InsertKeyViewStyles} from './types/insertKeyViewStyles';
import {InternalHTML} from './utils/webComponent/internalHTML';
import {InsertKeyView} from './views/insertKey/insertKeyView';
import {WebModel as WebModelClass} from './webModel/webModel';
import {ServiceIOFactory} from './services/serviceIOFactory';
import {ValidationHandler} from './types/validationHandler';
import {GoogleFont} from './utils/webComponent/googleFont';
import {DirectConnection} from './types/directConnection';
import {TextToSpeechConfig} from './types/textToSpeech';
import {SpeechToTextConfig} from './types/microphone';
import {ErrorMessages, OnError} from './types/error';
import {RequestBodyLimits} from './types/chatLimits';
import {Property} from './utils/decorators/property';
import {FireEvents} from './utils/events/fireEvents';
import {ValidateInput} from './types/validateInput';
import {WebModel} from './types/webModel/webModel';
import {DropupStyles} from './types/dropupStyles';
import {HTMLClassUtilities} from './types/html';
import {ChatView} from './views/chat/chatView';
import {ServiceIO} from './services/serviceIO';
import {Legacy} from './utils/legacy/legacy';
import {TextInput} from './types/textInput';
import {LoadHistory} from './types/history';
import {CustomStyle} from './types/styles';
import {Response} from './types/response';
import style from './deepChat.css?inline';
import {Connect} from './types/connect';
import {Avatars} from './types/avatars';
import {Names} from './types/names';
import {Demo} from './types/demo';

// TO-DO - ability to export files
// TO-DO - perhaps chat bubbles should start at the bottom which would allow nice slide up animation (optional)
export class DeepChat extends InternalHTML {
  @Property('object')
  connect?: Connect;

  @Property('object')
  directConnection?: DirectConnection;

  @Property('object')
  webModel?: WebModel;

  @Property('object')
  requestBodyLimits?: RequestBodyLimits;

  @Property('function')
  requestInterceptor?: RequestInterceptor;

  @Property('function')
  responseInterceptor?: ResponseInterceptor;

  @Property('function')
  validateInput?: ValidateInput;

  @Property('function')
  loadHistory?: LoadHistory;

  @Property('object')
  chatStyle?: CustomStyle;

  @Property('object')
  attachmentContainerStyle?: CustomStyle;

  @Property('object')
  dropupStyles?: DropupStyles;

  @Property('object')
  inputAreaStyle?: CustomStyle;

  @Property('object')
  textInput?: TextInput;

  @Property('object')
  submitButtonStyles?: SubmitButtonStyles;

  @Property('string')
  auxiliaryStyle?: string;

  @Property('array')
  history?: MessageContent[];

  @Property('object')
  introMessage?: IntroMessage | IntroMessage[];

  @Property('object')
  avatars?: Avatars;

  @Property('object')
  names?: Names;

  @Property('boolean')
  displayLoadingBubble?: boolean;

  @Property('object')
  errorMessages?: ErrorMessages;

  @Property('object')
  messageStyles?: MessageStyles;

  @Property('object')
  textToSpeech?: boolean | TextToSpeechConfig;

  @Property('object')
  speechToText?: boolean | SpeechToTextConfig; // only activated if not used for recording audio

  @Property('object')
  images?: boolean | FilesServiceConfig;

  @Property('object')
  gifs?: boolean | FilesServiceConfig;

  @Property('object')
  camera?: boolean | CameraFilesServiceConfig;

  @Property('object')
  audio?: boolean | FilesServiceConfig;

  @Property('object')
  microphone?: boolean | MicrophoneFilesServiceConfig;

  @Property('object')
  mixedFiles?: boolean | FilesServiceConfig;

  @Property('object')
  dragAndDrop?: boolean | CustomStyle; // by default it is enabled if file attachments are allowed

  @Property('object')
  introPanelStyle?: CustomStyle;

  @Property('object')
  htmlClassUtilities?: HTMLClassUtilities;

  getMessages: () => MessageContent[] = () => [];

  submitUserMessage: (content: UserContent) => void = () =>
    console.warn('submitUserMessage failed - please wait for chat view to render before calling this property.');

  addMessage: (message: Response, isUpdate?: boolean) => void = () =>
    console.warn('addMessage failed - please wait for chat view to render before calling this property.');

  focusInput: () => void = () => FocusUtils.focusFromParentElement(this._elementRef);

  refreshMessages: () => void = () => {};

  clearMessages: (isReset?: boolean) => void = () => {};

  scrollToBottom: () => void = () => {};

  disableSubmitButton: DisableSubmitButton = () => {};

  setPlaceholderText: (text: string) => void = () => {};

  @Property('function')
  onMessage?: OnMessage;

  @Property('function')
  onClearMessages?: () => void;

  @Property('function')
  onComponentRender?: (ref: DeepChat) => void;

  @Property('function')
  onError?: OnError;

  @Property('object')
  demo?: Demo;

  _hasBeenRendered = false;

  _auxiliaryStyleApplied = false;

  _activeService?: ServiceIO;

  _childElement?: HTMLElement;

  _validationHandler?: ValidationHandler;

  // TO-DO - key view style
  @Property('object')
  _insertKeyViewStyles?: InsertKeyViewStyles;

  constructor() {
    super();
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
    if (this._activeService) this._activeService.validateKeyProperty = false;
    this.onRender();
  }

  // prettier-ignore
  override onRender() {
    GoogleFont.attemptAppendStyleSheetToHead(this.style);
    Legacy.processConnect(this);
    if (!this._activeService || this._activeService.demo) this._activeService = ServiceIOFactory.create(this); 
    if (this.auxiliaryStyle && !this._auxiliaryStyleApplied) {
      WebComponentStyleUtils.apply(this.auxiliaryStyle, this.shadowRoot);
      this._auxiliaryStyleApplied = true;
    }
    WebComponentStyleUtils.applyDefaultStyleToComponent(this.style, this.chatStyle);
    Legacy.checkForContainerStyles(this, this._elementRef);
    if (this._activeService.key && this._activeService.validateKeyProperty) {
      ValidateKeyPropertyView.render(this._elementRef, this.changeToChatView.bind(this), this._activeService);
    } else if (!(this._activeService instanceof DirectServiceIO) || this._activeService.key) {
      // set before container populated, not available in constructor for react,
      // assigning to variable as it is added to panel and is no longer child (test in official website)
      this._childElement ??= this.children[0] as HTMLElement | undefined;
      ChatView.render(this, this._elementRef, this._activeService, this._childElement);
    } else if (this._activeService instanceof DirectServiceIO) { // when direct service with no key
      // the reason why this is not initiated in the constructor is because properties/attributes are not available
      // when it is executed, meaning that if the user sets customService or key, this would first appear and
      // then the chatview would be rendered after it, which causes a blink and is bad UX
      InsertKeyView.render(this._elementRef, this.changeToChatView.bind(this), this._activeService);
    }
    this._hasBeenRendered = true;
    FireEvents.onRender(this);
  }

  disconnectedCallback() {
    WebModelClass.chat = undefined;
  }
}

customElements.define('deep-chat', DeepChat);

// The following type makes it easier for other projects to use this component with TypeScript
declare global {
  interface HTMLElementTagNameMap {
    'deep-chat': DeepChat;
  }
}
