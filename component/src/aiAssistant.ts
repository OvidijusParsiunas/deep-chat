import {CameraFilesServiceConfig, FilesServiceConfig, MicrophoneFilesServiceConfig} from './types/fileServiceConfigs';
import {MessageStyles, MessageContent, OnNewMessage, ErrorMessages} from './types/messages';
import {ValidateKeyPropertyView} from './views/validateKeyProperty/validateKeyPropertyView';
import {WebComponentStyleUtils} from './utils/webComponent/webComponentStyleUtils';
import {ValidateMessageBeforeSending} from './types/validateMessageBeforeSending';
import {RequestInterceptor, ResponseInterceptor} from './types/interceptors';
import {IExistingServiceIO} from './services/utils/existingServiceIO';
import {FocusUtils} from './views/chat/input/textInput/focusUtils';
import {InternalHTML} from './utils/webComponent/internalHTML';
import {InsertKeyView} from './views/insertKey/insertKeyView';
import {ServiceIOFactory} from './services/serviceIOFactory';
import {RequestBodyMessageLimits} from './types/chatLimits';
import {GoogleFont} from './utils/webComponent/googleFont';
import {SubmitButtonStyles} from './types/submitButton';
import {RequestSettings} from './types/requestSettings';
import {ExistingService} from './types/existingService';
import {Property} from './utils/decorators/property';
import {DropupStyles} from './types/dropupStyles';
import {ErrorView} from './views/error/errorView';
import {ChatView} from './views/chat/chatView';
import {ServiceIO} from './services/serviceIO';
import {Microphone} from './types/microphone';
import style from './AiAssistant.css?inline';
import {TextInput} from './types/textInput';
import {CustomStyle} from './types/styles';
import {Avatars} from './types/avatars';
import {Names} from './types/names';

// TO-DO - ability to export files
// TO-DO - perhaps chat bubbles should start at the bottom which would allow nice slide up animation (optional)
export class AiAssistant extends InternalHTML {
  @Property('object')
  existingService?: ExistingService;

  @Property('object')
  request?: RequestSettings;

  @Property('boolean')
  stream?: boolean;

  @Property('object')
  requestBodyMessageLimits?: RequestBodyMessageLimits;

  @Property('object')
  attachmentContainerStyle?: CustomStyle;

  @Property('object')
  dragAndDrop?: boolean | CustomStyle; // by default it is enabled if file attachments are allowed

  @Property('object')
  speechToTextInput?: Microphone; // only activated if not used by recording for audio

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
  images?: boolean | FilesServiceConfig;

  @Property('object')
  audio?: boolean | FilesServiceConfig;

  @Property('object')
  mixedFiles?: boolean | FilesServiceConfig;

  @Property('object')
  camera?: boolean | CameraFilesServiceConfig;

  @Property('object')
  microphoneAudio?: boolean | MicrophoneFilesServiceConfig;

  @Property('object')
  introPanelStyle?: CustomStyle;

  @Property('object')
  errorMessages?: ErrorMessages;

  @Property('boolean')
  displayLoadingBubble?: boolean;

  @Property('string')
  auxiliaryStyle?: string;

  @Property('function')
  requestInterceptor?: RequestInterceptor;

  @Property('function')
  responseInterceptor?: ResponseInterceptor;

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

  _hasBeenRendered = false;

  _auxiliaryStyleApplied = false;

  _activeService?: ServiceIO;

  _childElement?: HTMLElement;

  // TO-DO - key view style

  constructor() {
    super();
    GoogleFont.appendStyleSheetToHead();
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

  // prettier-ignore
  override onRender() {
    // TO-DO - this will be moved to service selection view
    this._activeService ??= ServiceIOFactory.create(this);
    if (!this._activeService) return;
    if (this.auxiliaryStyle && !this._auxiliaryStyleApplied) {
      WebComponentStyleUtils.apply(this.auxiliaryStyle, this.shadowRoot);
      this._auxiliaryStyleApplied = true;
    }
    Object.assign(this._elementRef.style, this.containerStyle);
    if (this._activeService.key && this._activeService.validateConfigKey) {
      ValidateKeyPropertyView.render(this._elementRef, this.changeToChatView.bind(this), this._activeService);
    } else if ((this._activeService instanceof IExistingServiceIO && this._activeService.key)
        || this.request?.url || this.existingService?.demo) {
      // set before container populated, not available in constructor for react,
      // assigning to variable as it is added to panel and is no longer child
      this._childElement ??= this.children[0] as HTMLElement | undefined;
      ChatView.render(this, this._elementRef, this._activeService, this._childElement);
    } else if (this._activeService instanceof IExistingServiceIO) {
      // the reason why this is not initiated in the constructor is because properties/attributes are not available
      // when it is executed, meaning that if the user sets customService or key, this would first ppear and
      // then the chatview would be rendered after it, which causes a blink and is bad UX
      InsertKeyView.render(this._elementRef, this.changeToChatView.bind(this), this._activeService);
    } else {
      ErrorView.render(this._elementRef, 'Please define "request" with a "url"');
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
