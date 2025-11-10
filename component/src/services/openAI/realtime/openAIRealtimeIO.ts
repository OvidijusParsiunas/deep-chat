import {FUNCTION_CALL_OUTPUT, INPUT_TEXT, OPEN_AI_BASE_URL, OPEN_AI_KEY_HELP_URL} from '../openAIConsts';
import {OPEN_AI_BUILD_HEADERS, OPEN_AI_BUILD_KEY_VERIFICATION_DETAILS} from '../utils/openAIUtils';
import {SPEECH_SESSION_STARTED, SPEECH_SESSION_STOPPED} from '../../utils/speechConstants';
import {ButtonAccessibility} from '../../../views/chat/input/buttons/buttonAccessility';
import {CLASS_LIST, CREATE_ELEMENT, STYLE} from '../../../utils/consts/htmlConstants';
import {DEFINE_FUNCTION_HANDLER} from '../../../utils/errorMessages/errorMessages';
import {SpeechToSpeechEvents} from '../../../types/speechToSpeechEvents';
import {DirectConnection} from '../../../types/directConnection';
import {MICROPHONE_ICON_STRING} from '../../../icons/microphone';
import avatarUrl from '../../../../assets/person-avatar.png';
import {DEFAULT} from '../../../utils/consts/inputConstants';
import {OpenAIRealtimeButton} from './openAIRealtimeButton';
import {DirectServiceIO} from '../../utils/directServiceIO';
import {ObjectUtils} from '../../../utils/data/objectUtils';
import {FireEvents} from '../../../utils/events/fireEvents';
import {PLAY_ICON_STRING} from '../../../icons/playIcon';
import {STOP_ICON_STRING} from '../../../icons/stopIcon';
import {APIKey} from '../../../types/APIKey';
import {DeepChat} from '../../../deepChat';
import {
  OpenAIRealtimeButton as OpenAIRealtimeButtonT,
  OpenAIRealtimeInputAudioTranscription,
  OpenAIRealtimeFunctionHandler,
  OpenAIRealtimeMethods,
  OpenAIRealtimeConfig,
  OpenAIRealtime,
} from '../../../types/openAIRealtime';
import {
  INVALID_REQUEST_ERROR_PREFIX,
  CONTENT_TYPE_H_KEY,
  APPLICATION_JSON,
  AUTHORIZATION_H,
  BEARER_PREFIX,
  FUNCTION_CALL,
  OBJECT,
  POST,
} from '../../utils/serviceConstants';
import {
  DOCS_BASE_URL,
  MICROPHONE,
  AUDIO,
  ERROR,
  IMAGE,
  HTML,
  TEXT,
  TYPE,
  USER,
  AI,
  SRC,
} from '../../../utils/consts/messageConstants';

export class OpenAIRealtimeIO extends DirectServiceIO {
  override insertKeyPlaceholderText = this.genereteAPIKeyName('OpenAI');
  override keyHelpUrl = OPEN_AI_KEY_HELP_URL;
  private readonly _avatarConfig: OpenAIRealtime['avatar'];
  private readonly _buttonsConfig: OpenAIRealtime['buttons'];
  private readonly _errorConfig: OpenAIRealtime['error'];
  private readonly _loadingConfig: OpenAIRealtime['loading'];
  private readonly _avatarEl: HTMLImageElement;
  private readonly _containerEl: HTMLDivElement;
  private readonly _deepChat: DeepChat;
  private _microphoneButton: OpenAIRealtimeButton | null = null;
  private _toggleButton: OpenAIRealtimeButton | null = null;
  private _errorElement: HTMLDivElement | null = null;
  private _loadingElement: HTMLDivElement | null = null;
  private _pc: RTCPeerConnection | null = null;
  private _mediaStream: MediaStream | null = null;
  private _isMuted = false;
  private _ephemeralKey?: string;
  private _retrievingEphemeralKey?: Promise<string>;
  private _dc?: RTCDataChannel;
  private readonly _events?: SpeechToSpeechEvents;
  private readonly _functionHandlerI?: OpenAIRealtimeFunctionHandler;
  private static readonly BUTTON_DEFAULT = 'deep-chat-openai-realtime-button-default';
  private static readonly BUTTON_LOADING = 'deep-chat-openai-realtime-button-loading';
  private static readonly MICROPHONE_ACTIVE = 'deep-chat-openai-realtime-microphone-active';
  private static readonly UNAVAILABLE = 'deep-chat-openai-realtime-button-unavailable';

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = JSON.parse(JSON.stringify(deepChat.directConnection)) as DirectConnection;
    const key = OpenAIRealtimeIO.getKey(deepChat);
    super(deepChat, OPEN_AI_BUILD_KEY_VERIFICATION_DETAILS(), OPEN_AI_BUILD_HEADERS, {key});
    const config = directConnectionCopy.openAI?.realtime as OpenAIRealtime;
    if (typeof config === OBJECT) {
      this._avatarConfig = config.avatar;
      this._ephemeralKey = config.ephemeralKey;
      this._errorConfig = config[ERROR];
      this._loadingConfig = config.loading;
      Object.assign(this.rawBody, config.config);
      const realtime = deepChat.directConnection?.openAI?.realtime as OpenAIRealtime;
      const {function_handler} = realtime.config || {};
      if (function_handler) this._functionHandlerI = function_handler;
      this._events = config.events;
      realtime.methods = this.generateMethods();
      this.setInputAudioTranscribe(deepChat, realtime.config?.input_audio_transcription);
    }
    this.rawBody.model ??= 'gpt-4o-realtime-preview-2025-06-03';
    this._avatarConfig = OpenAIRealtimeIO.buildAvatarConfig(config);
    this._buttonsConfig = OpenAIRealtimeIO.buildButtonsConfig(config);
    this._avatarEl = OpenAIRealtimeIO.createAvatar(this._avatarConfig);
    this._containerEl = this.createContainer() as HTMLDivElement;
    this._deepChat = deepChat;
  }

  private static getKey(deepChat: DeepChat) {
    const openAI = (deepChat.directConnection as DirectConnection).openAI;
    if (openAI?.key) return openAI.key;
    const openAIRealtime = openAI?.realtime;
    if (typeof openAIRealtime === 'object' && (openAIRealtime.ephemeralKey || openAIRealtime.fetchEphemeralKey)) {
      return 'placeholder';
    }
    return undefined;
  }

  // https://community.openai.com/t/unable-to-access-user-audio-transcript-in-realtime-api/1001570/3
  private setInputAudioTranscribe(deepChat: DeepChat, transcription?: true | OpenAIRealtimeInputAudioTranscription) {
    if (transcription) {
      const defaultModel = 'whisper-1';
      if (typeof transcription === 'object') {
        this.rawBody.input_audio_transcription = {
          model: transcription.model || defaultModel,
          language: transcription.language,
          prompt: transcription.prompt,
        };
      } else {
        this.rawBody.input_audio_transcription = {
          model: defaultModel,
        };
      }
    } else if (deepChat.onMessage) {
      console.warn('To get user audio transcription, set `input_audio_transcription` in the `realtime` config.');
      console.warn(`See: ${DOCS_BASE_URL}directConnection/OpenAI/OpenAIRealtime#OpenAIRealtimeConfig`);
    }
  }

  // called after API key was inserted
  public setUpView(oldContainerElement: HTMLElement, parentElement: HTMLElement) {
    oldContainerElement[STYLE].display = 'none';
    parentElement.appendChild(this._containerEl);
    this.setup();
  }

  private async setup() {
    const openAI = this._deepChat.directConnection?.openAI;
    if (!openAI) return;
    const config = openAI?.realtime as OpenAIRealtime;
    if (typeof config !== 'object' || (!config.autoStart && !config.autoFetchEphemeralKey)) return;
    const key = this.key || (openAI as APIKey).key;
    if ((config.fetchEphemeralKey || key) && config.autoStart) {
      this.changeToUnavailable();
      this.displayLoading();
    }
    this.fetchEphemeralKey(config.autoStart);
  }

  private async fetchEphemeralKey(start?: boolean) {
    const openAI = this._deepChat.directConnection?.openAI;
    const fetchEphemeralKey = typeof openAI?.realtime === 'object' ? openAI?.realtime.fetchEphemeralKey : undefined;
    const config = openAI?.realtime;
    const key = this.key || (openAI as APIKey).key;
    if (typeof config === 'object') {
      if (!this._ephemeralKey) {
        try {
          if (fetchEphemeralKey) {
            const retrievingEphemeralKey = fetchEphemeralKey();
            if ((retrievingEphemeralKey as Promise<string>).then) {
              this._retrievingEphemeralKey = retrievingEphemeralKey as Promise<string>;
            }
            this._ephemeralKey = await retrievingEphemeralKey;
          } else if (key) {
            this._retrievingEphemeralKey = this.getEphemeralKey(key);
            this._ephemeralKey = await this._retrievingEphemeralKey;
          }
        } catch (e) {
          this.displayFailedToRetrieveEphemeralKey(e);
        }
      }
      if (this._ephemeralKey) {
        if (start) {
          this.init(this._ephemeralKey);
        } else {
          this.changeToAvailable();
        }
      }
    } else if (key) {
      try {
        this._retrievingEphemeralKey = this.getEphemeralKey(key);
        this._ephemeralKey = await this._retrievingEphemeralKey;
        if (start) this.init(this._ephemeralKey);
      } catch (e) {
        this.displayFailedToRetrieveEphemeralKey(e);
      }
    }
  }

  private async getEphemeralKey(key: string) {
    // https://platform.openai.com/docs/api-reference/realtime-sessions/create
    const result = await fetch(`${OPEN_AI_BASE_URL}realtime/sessions`, {
      method: POST,
      body: JSON.stringify(this.rawBody),
      headers: {
        [CONTENT_TYPE_H_KEY]: APPLICATION_JSON,
        [AUTHORIZATION_H]: `${BEARER_PREFIX}${key}`,
      },
    });
    const data = await result.json();
    return data.client_secret.value;
  }

  private generateMethods(): OpenAIRealtimeMethods {
    return {
      updateConfig: (config: OpenAIRealtimeConfig) => {
        // https://platform.openai.com/docs/api-reference/realtime-client-events/session
        this._dc?.send(JSON.stringify({[TYPE]: 'session.update', session: config}));
      },
      sendMessage: (text: string, role?: 'user' | 'assistant' | 'system') => {
        // https://platform.openai.com/docs/api-reference/realtime-client-events/conversation/item/create
        const messageRole = role || 'system';
        const content = [{[TYPE]: messageRole === 'system' || messageRole === USER ? INPUT_TEXT : TEXT, text}];
        const item = {role: messageRole, [TYPE]: 'message', content};
        this.sendMessage(item);
      },
    };
  }

  private static buildAvatarConfig(config?: OpenAIRealtime) {
    const newConfig = typeof config === 'object' && config.avatar ? JSON.parse(JSON.stringify(config.avatar)) : {};
    newConfig.maxScale = newConfig.maxScale && newConfig.maxScale >= 1 ? newConfig.maxScale : 2.5;
    return newConfig;
  }

  private static buildButtonsConfig(config?: OpenAIRealtime) {
    const newConfig = typeof config === 'object' && config.buttons ? JSON.parse(JSON.stringify(config.buttons)) : {};
    if (!newConfig[MICROPHONE]?.[DEFAULT]?.[TEXT]?.content) {
      newConfig[MICROPHONE] ??= {};
      newConfig[MICROPHONE][DEFAULT] ??= {};
      newConfig[MICROPHONE][DEFAULT].svg ??= {};
      newConfig[MICROPHONE][DEFAULT].svg.content ??= MICROPHONE_ICON_STRING;
    }
    if (!newConfig.toggle?.[DEFAULT]?.[TEXT]?.content) {
      newConfig.toggle ??= {};
      newConfig.toggle[DEFAULT] ??= {};
      newConfig.toggle[DEFAULT].svg ??= {};
      newConfig.toggle[DEFAULT].svg.content ??= PLAY_ICON_STRING;
      newConfig.toggle.active ??= {};
      newConfig.toggle.active.svg ??= {};
      newConfig.toggle.active.svg.content ??= STOP_ICON_STRING;
    }
    return newConfig;
  }

  private createContainer() {
    const container = CREATE_ELEMENT();
    container.id = 'deep-chat-openai-realtime-container';
    container.appendChild(this.createAvatarContainer());
    container.appendChild(this.createButtonsContainer());
    container.appendChild(this.createError());
    return container;
  }

  private createAvatarContainer() {
    const avatarContainer = CREATE_ELEMENT();
    avatarContainer.id = 'deep-chat-openai-realtime-avatar-container';
    Object.assign(avatarContainer[STYLE], this._avatarConfig?.styles?.container);
    avatarContainer.appendChild(this._avatarEl);
    return avatarContainer;
  }

  private static createAvatar(config?: OpenAIRealtime['avatar']) {
    const avatar = CREATE_ELEMENT('img') as HTMLImageElement;
    avatar.id = 'deep-chat-openai-realtime-avatar';
    Object.assign(avatar[STYLE], config?.styles?.[IMAGE]);
    avatar[SRC] = config?.[SRC] || avatarUrl;
    return avatar;
  }

  private createButtonsContainer() {
    const buttonsContainer = CREATE_ELEMENT();
    buttonsContainer.id = 'deep-chat-openai-realtime-buttons-container';
    Object.assign(buttonsContainer[STYLE], this._buttonsConfig?.container);
    this._microphoneButton = this.createMicophoneButton();
    const microphoneButtonEl = OpenAIRealtimeIO.createButtonContainer(this._microphoneButton.elementRef);
    this._toggleButton = this.createToggleButton();
    const toggleButtonEl = OpenAIRealtimeIO.createButtonContainer(this._toggleButton.elementRef);
    buttonsContainer.appendChild(microphoneButtonEl);
    buttonsContainer.appendChild(toggleButtonEl);
    buttonsContainer.appendChild(this.createLoading());
    return buttonsContainer;
  }

  private static createButtonContainer(optionChildElement: HTMLElement) {
    const buttonContainer = CREATE_ELEMENT();
    buttonContainer[CLASS_LIST].add('deep-chat-openai-realtime-button-container');
    buttonContainer.appendChild(optionChildElement);
    return buttonContainer;
  }

  private createMicophoneButton() {
    const micorphoneButton = new OpenAIRealtimeButton(this._buttonsConfig?.[MICROPHONE] as OpenAIRealtimeButtonT);
    micorphoneButton.elementRef[CLASS_LIST].add(OpenAIRealtimeIO.BUTTON_DEFAULT, 'deep-chat-openai-realtime-microphone');
    micorphoneButton.elementRef.onclick = () => {
      if (micorphoneButton.isActive) {
        this.toggleMicorphone(true);
        micorphoneButton.elementRef[CLASS_LIST].replace(
          OpenAIRealtimeIO.MICROPHONE_ACTIVE,
          OpenAIRealtimeIO.BUTTON_DEFAULT
        );
        micorphoneButton.changeToDefault();
        this._isMuted = false;
      } else {
        this.toggleMicorphone(false);
        micorphoneButton.elementRef[CLASS_LIST].replace(
          OpenAIRealtimeIO.BUTTON_DEFAULT,
          OpenAIRealtimeIO.MICROPHONE_ACTIVE
        );
        ButtonAccessibility.removeAriaAttributes(micorphoneButton.elementRef);
        micorphoneButton.changeToActive();
        this._isMuted = true;
      }
    };
    return micorphoneButton;
  }

  private toggleMicorphone(isMute: boolean) {
    this._mediaStream?.getAudioTracks().forEach((track) => (track.enabled = isMute));
  }

  private createToggleButton() {
    const toggleButton = new OpenAIRealtimeButton(this._buttonsConfig?.toggle as OpenAIRealtimeButtonT);
    toggleButton.elementRef[CLASS_LIST].add(OpenAIRealtimeIO.BUTTON_DEFAULT, 'deep-chat-openai-realtime-toggle');
    toggleButton.elementRef.onclick = async () => {
      if (toggleButton.isActive) {
        toggleButton.changeToDefault();
        this.stop();
      } else {
        try {
          if (this._ephemeralKey) {
            this.displayLoading();
            await this.init(this._ephemeralKey);
          } else if (this._retrievingEphemeralKey) {
            this.displayLoading();
            const ephemeralKey = await this._retrievingEphemeralKey;
            if (this._toggleButton?.isActive) {
              await this.init(ephemeralKey);
            }
          } else {
            this.displayLoading();
            await this.fetchEphemeralKey(true);
          }
        } catch (error) {
          console[ERROR]('Failed to start conversation:', error);
          this.displayError();
          this.hideLoading();
        }
      }
    };
    return toggleButton;
  }

  private async init(ephemeralKey: string) {
    const peerConnection = new RTCPeerConnection();
    this._pc = peerConnection;

    // Set up to play remote audio from the model
    const audioEl = CREATE_ELEMENT(AUDIO) as HTMLAudioElement;
    audioEl.autoplay = true;
    const audioContext = new AudioContext();

    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256; // Determines frequency resolution
    const frequencyData = new Uint8Array(analyser.frequencyBinCount);

    // Monitor when tracks are added to the peer connection
    this._pc.ontrack = async (e) => {
      if (e.streams[0]) {
        audioEl.srcObject = e.streams[0];

        const source = audioContext.createMediaStreamSource(e.streams[0]);
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
          // console.log('AudioContext resumed');
        }
        source.connect(analyser);
        this.monitorFrequencies(analyser, frequencyData);
      } else {
        console[ERROR]('No streams found in the ontrack event.');
        this.displayError();
      }
    };

    // Add local audio track for microphone input in the browser
    await navigator.mediaDevices
      .getUserMedia({
        audio: true,
      })
      .then((stream) => {
        // prevent using stale pc when user spams toggle button
        if (peerConnection === this._pc) {
          this._mediaStream = stream;
          this._pc?.addTrack(this._mediaStream.getTracks()[0]);
          if (this._isMuted) this.toggleMicorphone(false);
        }
      })
      .catch((error) => {
        console[ERROR]('Error accessing microphone:', error);
        this.displayError();
      });

    // Set up data channel for sending and receiving events
    this._dc = this._pc.createDataChannel('oai-events');
    this._dc.addEventListener('message', async (e) => {
      // Realtime server events appear here!
      const response = JSON.parse(e.data);
      if (response.type === 'session.created') {
        this.removeUnavailable();
        if (this._toggleButton) {
          ButtonAccessibility.removeAriaAttributes(this._toggleButton.elementRef);
          this._toggleButton.changeToActive();
        }
        this._events?.started?.();
        this._deepChat.dispatchEvent(new CustomEvent(SPEECH_SESSION_STARTED));
        this.hideLoading();
      } else if (response.type === 'response.done') {
        const message = JSON.parse(e.data);
        const output = message.response.output?.[0];
        if (output?.type === FUNCTION_CALL) {
          const {name, call_id} = output;
          try {
            await this.handleTool(name, output.arguments, call_id);
          } catch (e) {
            this.stopOnError(e as string);
          }
        }
        // https://platform.openai.com/docs/api-reference/realtime-server-events/error
      } else if (response.type === ERROR) {
        this.stopOnError(response[ERROR].message);
        // https://platform.openai.com/docs/guides/realtime-model-capabilities#error-handling
      } else if (response.type === INVALID_REQUEST_ERROR_PREFIX) {
        this.stopOnError(response.message);
      } else if (response.type === 'response.audio_transcript.delta') {
        // console.log(response.delta);
      } else if (response.type === 'response.audio_transcript.done') {
        if (response.transcript) {
          FireEvents.onMessage(this._deepChat, {role: AI, [TEXT]: response.transcript}, false);
        }
      } else if (response.type === 'conversation.item.input_audio_transcription.completed') {
        if (response.transcript) {
          FireEvents.onMessage(this._deepChat, {role: USER, [TEXT]: response.transcript}, false);
        }
      }
    });

    // Start the session using the Session Description Protocol (SDP)
    try {
      const offer = await this._pc.createOffer();
      if (peerConnection !== this._pc) return; // prevent using stale pc when user spams toggle button
      await this._pc.setLocalDescription(offer);
      if (peerConnection !== this._pc) return; // prevent using stale pc when user spams toggle button
      const sdpResponse = await fetch(`${OPEN_AI_BASE_URL}realtime`, {
        method: POST,
        body: offer.sdp,
        headers: {
          [AUTHORIZATION_H]: `${BEARER_PREFIX}${ephemeralKey}`,
          [CONTENT_TYPE_H_KEY]: 'application/sdp',
        },
      });
      if (peerConnection !== this._pc) return; // prevent using stale pc when user spams toggle button
      const answer: RTCSessionDescriptionInit = {
        [TYPE]: 'answer',
        sdp: await sdpResponse[TEXT](),
      };
      if (peerConnection !== this._pc) return; // prevent using stale pc when user spams toggle button
      await this._pc.setRemoteDescription(answer);
      if (peerConnection !== this._pc) return; // prevent using stale pc when user spams toggle button
    } catch (e) {
      console[ERROR](e);
      this.displayError();
    }
  }

  // there is a bug where sometimes upon refreshing the browser too many times the frequencyData is all 0s
  // in such instance please wait and refresh at a later time
  private monitorFrequencies(analyser: AnalyserNode, frequencyData: Uint8Array<ArrayBuffer>) {
    const updateFrequencyData = () => {
      analyser.getByteFrequencyData(frequencyData);
      // Calculate loudness (sum of all frequency amplitudes)
      const totalLoudness = frequencyData.reduce((sum, value) => sum + value, 0);
      const maxLoudness = frequencyData.length * 255; // Maximum possible loudness
      const normalizedLoudness = (totalLoudness / maxLoudness) * 100; // Scale to 100p

      // const hasAudio = frequencyData.some((value) => value > 0);
      // if (hasAudio) console.log('Non-zero frequency data detected');

      // Update the avatar scale
      const minScale = 1;
      const scale = minScale + (normalizedLoudness / 100) * ((this._avatarConfig?.maxScale as number) - minScale);
      this._avatarEl[STYLE].transform = `scale(${scale})`;

      requestAnimationFrame(updateFrequencyData);
    };

    updateFrequencyData();
  }

  private stopOnError(error: string) {
    this.stop();
    console[ERROR](error);
    this.displayError();
  }

  private stop() {
    this._mediaStream?.getTracks().forEach((track) => track.stop());
    this._mediaStream = null;
    if (this._pc) {
      this._pc.close();
      this._pc = null;
      this._events?.stopped?.();
      this._deepChat.dispatchEvent(new CustomEvent(SPEECH_SESSION_STOPPED));
      this._dc = undefined;
    }
  }

  private changeToUnavailable() {
    if (this._microphoneButton) OpenAIRealtimeIO.changeButtonToUnavailable(this._microphoneButton);
    if (this._toggleButton) OpenAIRealtimeIO.changeButtonToUnavailable(this._toggleButton);
  }

  private static changeButtonToUnavailable(button: OpenAIRealtimeButton) {
    button.elementRef[CLASS_LIST].add(OpenAIRealtimeIO.UNAVAILABLE);
    ButtonAccessibility.removeAriaBusy(button.elementRef);
    ButtonAccessibility.addAriaDisabled(button.elementRef);
    button.changeToUnavailable();
  }

  private changeToAvailable() {
    if (this._microphoneButton) OpenAIRealtimeIO.changeButtonToAvailable(this._microphoneButton);
    if (this._toggleButton) OpenAIRealtimeIO.changeButtonToAvailable(this._toggleButton);
  }

  private static changeButtonToAvailable(button: OpenAIRealtimeButton) {
    OpenAIRealtimeIO.removeButtonUnavailable(button);
    button.changeToDefault();
  }

  private removeUnavailable() {
    if (this._microphoneButton) OpenAIRealtimeIO.removeButtonUnavailable(this._microphoneButton);
    if (this._toggleButton) OpenAIRealtimeIO.removeButtonUnavailable(this._toggleButton);
  }

  private static removeButtonUnavailable(button: OpenAIRealtimeButton) {
    ButtonAccessibility.removeAriaDisabled(button.elementRef);
    button.elementRef[CLASS_LIST].remove(OpenAIRealtimeIO.UNAVAILABLE);
  }

  private createError() {
    const error = CREATE_ELEMENT() as HTMLDivElement;
    error.id = 'deep-chat-openai-realtime-error';
    Object.assign(error[STYLE], this._errorConfig?.[STYLE]);
    this._errorElement = error;
    return error;
  }

  private displayFailedToRetrieveEphemeralKey(e: unknown) {
    console[ERROR]('Failed to retrieve ephemeral key');
    console[ERROR](e);
    this.displayError();
  }

  private displayError() {
    if (this._errorElement) {
      this._errorElement[STYLE].display = 'block';
      this._errorElement.textContent = this._errorConfig?.[TEXT] || 'Error';
      this.changeToUnavailable();
    }
    this.hideLoading();
  }

  private createLoading() {
    const loading = CREATE_ELEMENT() as HTMLDivElement;
    loading.id = 'deep-chat-openai-realtime-loading';
    this._loadingElement = loading;
    if (this._loadingConfig?.[HTML]) this._loadingElement.innerHTML = this._loadingConfig[HTML];
    Object.assign(loading[STYLE], this._loadingConfig?.[STYLE]);
    loading[STYLE].display = 'none';
    return loading;
  }

  private displayLoading() {
    if (this._toggleButton) {
      this._toggleButton.changeToActive();
      this._toggleButton.elementRef[CLASS_LIST].add(OpenAIRealtimeIO.BUTTON_LOADING);
      ButtonAccessibility.removeAriaDisabled(this._toggleButton.elementRef);
      ButtonAccessibility.addAriaBusy(this._toggleButton.elementRef);
    }
    if ((typeof this._loadingConfig?.display !== 'boolean' || this._loadingConfig.display) && this._loadingElement) {
      this._loadingElement[STYLE].display = 'block';
      if (!this._loadingConfig?.[HTML]) this._loadingElement.textContent = this._loadingConfig?.[TEXT] || 'Loading';
    }
  }

  private hideLoading() {
    if (this._toggleButton) {
      this._toggleButton.elementRef[CLASS_LIST].remove(OpenAIRealtimeIO.BUTTON_LOADING);
      ButtonAccessibility.removeAriaBusy(this._toggleButton.elementRef);
    }
    if (this._loadingElement) {
      this._loadingElement[STYLE].display = 'none';
    }
  }

  // https://platform.openai.com/docs/guides/function-calling?api-mode=responses
  private async handleTool(name: string, functionArguments: string, call_id: string) {
    if (!this._functionHandlerI) {
      throw Error(DEFINE_FUNCTION_HANDLER);
    }
    const result = await this._functionHandlerI({name, arguments: functionArguments});
    if (typeof result !== 'object' || !ObjectUtils.isJson(result)) {
      throw Error('The `function_handler` response must be a JSON object, e.g. {response: "My response"}');
    }
    const item = {[TYPE]: FUNCTION_CALL_OUTPUT, call_id, output: JSON.stringify(result)};
    this.sendMessage(item);
  }

  // https://platform.openai.com/docs/api-reference/realtime-client-events/conversation/item/create
  sendMessage(item: object) {
    if (!this._dc) return;
    const message = JSON.stringify({[TYPE]: 'conversation.item.create', item});
    this._dc.send(message);
    const responseCreatePayload = {[TYPE]: 'response.create'};
    this._dc.send(JSON.stringify(responseCreatePayload));
  }

  override isCustomView() {
    return true;
  }
}
