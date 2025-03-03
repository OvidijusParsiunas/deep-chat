import {ButtonAccessibility} from '../../../views/chat/input/buttons/buttonAccessility';
import {DirectConnection} from '../../../types/directConnection';
import {MICROPHONE_ICON_STRING} from '../../../icons/microphone';
import avatarUrl from '../../../../assets/person-avatar.png';
import {OpenAIRealtimeButton} from './openAIRealtimeButton';
import {DirectServiceIO} from '../../utils/directServiceIO';
import {ObjectUtils} from '../../../utils/data/objectUtils';
import {PLAY_ICON_STRING} from '../../../icons/playIcon';
import {STOP_ICON_STRING} from '../../../icons/stopIcon';
import {OpenAIUtils} from '../utils/openAIUtils';
import {APIKey} from '../../../types/APIKey';
import {DeepChat} from '../../../deepChat';
import {
  OpenAIRealtimeButton as OpenAIRealtimeButtonT,
  OpenAIRealtimeFunctionHandler,
  OpenAIRealTime,
} from '../../../types/openAIRealtime';

export class OpenAIRealtimeIO extends DirectServiceIO {
  override insertKeyPlaceholderText = 'OpenAI API Key';
  override keyHelpUrl = 'https://platform.openai.com/account/api-keys';
  private readonly _avatarConfig: OpenAIRealTime['avatar'];
  private readonly _buttonsConfig: OpenAIRealTime['buttons'];
  private readonly _errorConfig: OpenAIRealTime['error'];
  private readonly _loadingConfig: OpenAIRealTime['loading'];
  private readonly _avatarEl: HTMLImageElement;
  private readonly _containerEl: HTMLDivElement;
  private readonly _deepChat: DeepChat;
  private _muteButton: OpenAIRealtimeButton | null = null;
  private _toggleButton: OpenAIRealtimeButton | null = null;
  private _errorElement: HTMLDivElement | null = null;
  private _loadingElement: HTMLDivElement | null = null;
  private _pc: RTCPeerConnection | null = null;
  private _mediaStream: MediaStream | null = null;
  private _isMuted = false;
  private _ephemeralKey?: string;
  private _retrievingEphemeralKey?: Promise<string>;
  private readonly _functionHandler?: OpenAIRealtimeFunctionHandler;
  private static readonly BUTTON_DEFAULT = 'deep-chat-openai-realtime-button-default';
  private static readonly BUTTON_LOADING = 'deep-chat-openai-realtime-button-loading';
  private static readonly MUTE_ACTIVE = 'deep-chat-openai-realtime-mute-active';
  private static readonly UNAVAILABLE = 'deep-chat-openai-realtime-button-unavailable';

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = JSON.parse(JSON.stringify(deepChat.directConnection)) as DirectConnection;
    const key = OpenAIRealtimeIO.getKey(deepChat);
    super(deepChat, OpenAIUtils.buildKeyVerificationDetails(), OpenAIUtils.buildHeaders, {key});
    const config = directConnectionCopy.openAI?.realtime as OpenAIRealTime;
    if (typeof config === 'object') {
      this._avatarConfig = config.avatar;
      this._ephemeralKey = config.ephemeralKey;
      this._errorConfig = config.error;
      this._loadingConfig = config.loading;
      Object.assign(this.rawBody, config.config);
      const {function_handler} = (deepChat.directConnection?.openAI?.realtime as OpenAIRealTime).config || {};
      if (function_handler) this._functionHandler = function_handler;
    }
    this.rawBody.model ??= 'gpt-4o-realtime-preview-2024-12-17';
    this._avatarConfig = OpenAIRealtimeIO.buildAvatarConfig(config);
    this._buttonsConfig = OpenAIRealtimeIO.buildButtonsConfig(config);
    this._avatarEl = OpenAIRealtimeIO.createAvatar(this._avatarConfig);
    this._containerEl = this.createContainer();
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

  // called after API key was inserted
  public setUpView(oldContainerElement: HTMLElement, parentElement: HTMLElement) {
    oldContainerElement.style.display = 'none';
    parentElement.appendChild(this._containerEl);
    this.setup();
  }

  private async setup() {
    const openAI = this._deepChat.directConnection?.openAI;
    if (!openAI) return;
    const config = openAI?.realtime as OpenAIRealTime;
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
    const result = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      body: JSON.stringify(this.rawBody),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
    });
    const data = await result.json();
    return data.client_secret.value;
  }

  private static buildAvatarConfig(config?: OpenAIRealTime) {
    const newConfig = typeof config === 'object' && config.avatar ? JSON.parse(JSON.stringify(config.avatar)) : {};
    newConfig.maxScale = newConfig.maxScale && newConfig.maxScale >= 1 ? newConfig.maxScale : 2.5;
    return newConfig;
  }

  private static buildButtonsConfig(config?: OpenAIRealTime) {
    const newConfig = typeof config === 'object' && config.buttons ? JSON.parse(JSON.stringify(config.buttons)) : {};
    if (!newConfig.microphone?.default?.text?.content) {
      newConfig.microphone ??= {};
      newConfig.microphone.default ??= {};
      newConfig.microphone.default.svg ??= {};
      newConfig.microphone.default.svg.content = MICROPHONE_ICON_STRING;
    }
    if (!newConfig.toggle?.default?.text?.content) {
      newConfig.toggle ??= {};
      newConfig.toggle.default ??= {};
      newConfig.toggle.default.svg ??= {};
      newConfig.toggle.default.svg.content = PLAY_ICON_STRING;
      newConfig.toggle.active ??= {};
      newConfig.toggle.active.svg ??= {};
      newConfig.toggle.active.svg.content = STOP_ICON_STRING;
    }
    return newConfig;
  }

  private createContainer() {
    const container = document.createElement('div');
    container.id = 'deep-chat-openai-realtime-container';
    container.appendChild(this.createAvatarContainer());
    container.appendChild(this.createButtonsContainer());
    container.appendChild(this.createError());
    return container;
  }

  private createAvatarContainer() {
    const avatarContainer = document.createElement('div');
    avatarContainer.id = 'deep-chat-openai-realtime-avatar-container';
    Object.assign(avatarContainer.style, this._avatarConfig?.styles?.container);
    avatarContainer.appendChild(this._avatarEl);
    return avatarContainer;
  }

  private static createAvatar(config?: OpenAIRealTime['avatar']) {
    const avatar = document.createElement('img');
    avatar.id = 'deep-chat-openai-realtime-avatar';
    Object.assign(avatar.style, config?.styles?.avatar);
    avatar.src = config?.src || avatarUrl;
    return avatar;
  }

  private createButtonsContainer() {
    const buttonsContainer = document.createElement('div');
    buttonsContainer.id = 'deep-chat-openai-realtime-buttons-container';
    Object.assign(buttonsContainer.style, this._buttonsConfig?.container);
    this._muteButton = this.createMuteButton();
    const muteButtonEl = OpenAIRealtimeIO.createButtonContainer(this._muteButton.elementRef);
    this._toggleButton = this.createToggleButton();
    const toggleButtonEl = OpenAIRealtimeIO.createButtonContainer(this._toggleButton.elementRef);
    buttonsContainer.appendChild(muteButtonEl);
    buttonsContainer.appendChild(toggleButtonEl);
    buttonsContainer.appendChild(this.createLoading());
    return buttonsContainer;
  }

  private static createButtonContainer(optionChildElement: HTMLElement) {
    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('deep-chat-openai-realtime-button-container');
    buttonContainer.appendChild(optionChildElement);
    return buttonContainer;
  }

  private createMuteButton() {
    const muteButton = new OpenAIRealtimeButton(this._buttonsConfig?.microphone as OpenAIRealtimeButtonT);
    muteButton.elementRef.classList.replace('input-button-svg', 'deep-chat-openai-realtime-button');
    muteButton.elementRef.classList.add(OpenAIRealtimeIO.BUTTON_DEFAULT, 'deep-chat-openai-realtime-mute');
    muteButton.elementRef.onclick = () => {
      if (muteButton.isActive) {
        this.toggleMute(true);
        muteButton.elementRef.classList.replace(OpenAIRealtimeIO.MUTE_ACTIVE, OpenAIRealtimeIO.BUTTON_DEFAULT);
        muteButton.changeToDefault();
        this._isMuted = false;
      } else {
        this.toggleMute(false);
        muteButton.elementRef.classList.replace(OpenAIRealtimeIO.BUTTON_DEFAULT, OpenAIRealtimeIO.MUTE_ACTIVE);
        ButtonAccessibility.removeAriaAttributes(muteButton.elementRef);
        muteButton.changeToActive();
        this._isMuted = true;
      }
    };
    return muteButton;
  }

  private toggleMute(isMute: boolean) {
    this._mediaStream?.getAudioTracks().forEach((track) => (track.enabled = isMute));
  }

  private createToggleButton() {
    const toggleButton = new OpenAIRealtimeButton(this._buttonsConfig?.toggle as OpenAIRealtimeButtonT);
    toggleButton.elementRef.classList.replace('input-button-svg', 'deep-chat-openai-realtime-button');
    toggleButton.elementRef.classList.add(OpenAIRealtimeIO.BUTTON_DEFAULT, 'deep-chat-openai-realtime-toggle');
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
          console.error('Failed to start conversation:', error);
          this.displayError('Error');
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
    const audioEl = document.createElement('audio');
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
        console.error('No streams found in the ontrack event.');
        this.displayError('Error');
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
          if (this._isMuted) this.toggleMute(false);
        }
      })
      .catch((error) => {
        console.error('Error accessing microphone:', error);
        this.displayError('Error');
      });

    // Set up data channel for sending and receiving events
    const dc = this._pc.createDataChannel('oai-events');
    dc.addEventListener('message', async (e) => {
      // Realtime server events appear here!
      const response = JSON.parse(e.data);
      if (response.type === 'session.created') {
        this.removeUnavailable();
        if (this._toggleButton) {
          ButtonAccessibility.removeAriaAttributes(this._toggleButton.elementRef);
          this._toggleButton.changeToActive();
        }
        this.hideLoading();
      } else if (response.type === 'response.done') {
        const message = JSON.parse(e.data);
        const output = message.response.output?.[0];
        if (output?.type === 'function_call') {
          const {name, call_id} = output;
          try {
            await this.handleTool(name, output.arguments, call_id, dc);
          } catch (e) {
            this.stopOnError(e as string);
          }
        }
        // https://platform.openai.com/docs/api-reference/realtime-server-events/error
      } else if (response.type === 'error') {
        this.stopOnError(response.error.message);
        // https://platform.openai.com/docs/guides/realtime-model-capabilities#error-handling
      } else if (response.type === 'invalid_request_error') {
        this.stopOnError(response.message);
      } else if (response.type === 'response.audio_transcript.delta') {
        // console.log(response.delta);
      }
    });

    // Start the session using the Session Description Protocol (SDP)
    try {
      const offer = await this._pc.createOffer();
      if (peerConnection !== this._pc) return; // prevent using stale pc when user spams toggle button
      await this._pc.setLocalDescription(offer);
      if (peerConnection !== this._pc) return; // prevent using stale pc when user spams toggle button
      const sdpResponse = await fetch('https://api.openai.com/v1/realtime', {
        method: 'POST',
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${ephemeralKey}`,
          'Content-Type': 'application/sdp',
        },
      });
      if (peerConnection !== this._pc) return; // prevent using stale pc when user spams toggle button
      const answer: RTCSessionDescriptionInit = {
        type: 'answer',
        sdp: await sdpResponse.text(),
      };
      if (peerConnection !== this._pc) return; // prevent using stale pc when user spams toggle button
      await this._pc.setRemoteDescription(answer);
      if (peerConnection !== this._pc) return; // prevent using stale pc when user spams toggle button
    } catch (e) {
      console.error(e);
      this.displayError('Error');
    }
  }

  // there is a bug where sometimes upon refreshing the browser too many times the frequencyData is all 0s
  // in such instance please wait and refresh at a later time
  private monitorFrequencies(analyser: AnalyserNode, frequencyData: Uint8Array) {
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
      this._avatarEl.style.transform = `scale(${scale})`;

      requestAnimationFrame(updateFrequencyData);
    };

    updateFrequencyData();
  }

  private stopOnError(error: string) {
    this.stop();
    console.error(error);
    this.displayError('Error');
  }

  private stop() {
    this._mediaStream?.getTracks().forEach((track) => track.stop());
    this._mediaStream = null;
    if (this._pc) {
      this._pc.close();
      this._pc = null;
    }
  }

  private changeToUnavailable() {
    if (this._muteButton) OpenAIRealtimeIO.changeButtonToUnavailable(this._muteButton);
    if (this._toggleButton) OpenAIRealtimeIO.changeButtonToUnavailable(this._toggleButton);
  }

  private static changeButtonToUnavailable(button: OpenAIRealtimeButton) {
    button.elementRef.classList.add(OpenAIRealtimeIO.UNAVAILABLE);
    ButtonAccessibility.removeAriaBusy(button.elementRef);
    ButtonAccessibility.addAriaDisabled(button.elementRef);
    button.changeToUnavailable();
  }

  private changeToAvailable() {
    if (this._muteButton) OpenAIRealtimeIO.changeButtonToAvailable(this._muteButton);
    if (this._toggleButton) OpenAIRealtimeIO.changeButtonToAvailable(this._toggleButton);
  }

  private static changeButtonToAvailable(button: OpenAIRealtimeButton) {
    OpenAIRealtimeIO.removeButtonUnavailable(button);
    button.changeToDefault();
  }

  private removeUnavailable() {
    if (this._muteButton) OpenAIRealtimeIO.removeButtonUnavailable(this._muteButton);
    if (this._toggleButton) OpenAIRealtimeIO.removeButtonUnavailable(this._toggleButton);
  }

  private static removeButtonUnavailable(button: OpenAIRealtimeButton) {
    ButtonAccessibility.removeAriaDisabled(button.elementRef);
    button.elementRef.classList.remove(OpenAIRealtimeIO.UNAVAILABLE);
  }

  private createError() {
    const error = document.createElement('div');
    error.id = 'deep-chat-openai-realtime-error';
    Object.assign(error.style, this._errorConfig?.style);
    this._errorElement = error;
    return error;
  }

  private displayFailedToRetrieveEphemeralKey(e: unknown) {
    console.error('Failed to retrieve ephemeral key');
    console.error(e);
    this.displayError('Error');
  }

  private displayError(text: string) {
    if (this._errorElement) {
      this._errorElement.style.display = 'block';
      this._errorElement.textContent = this._errorConfig?.text || text;
      this.changeToUnavailable();
    }
  }

  private createLoading() {
    const loading = document.createElement('div');
    loading.id = 'deep-chat-openai-realtime-loading';
    this._loadingElement = loading;
    if (this._loadingConfig?.html) this._loadingElement.innerHTML = this._loadingConfig.html;
    Object.assign(loading.style, this._loadingConfig?.style);
    loading.style.display = 'none';
    return loading;
  }

  private displayLoading() {
    if (this._toggleButton) {
      this._toggleButton.changeToActive();
      this._toggleButton.elementRef.classList.add(OpenAIRealtimeIO.BUTTON_LOADING);
      ButtonAccessibility.removeAriaDisabled(this._toggleButton.elementRef);
      ButtonAccessibility.addAriaBusy(this._toggleButton.elementRef);
    }
    if ((typeof this._loadingConfig?.display !== 'boolean' || this._loadingConfig.display) && this._loadingElement) {
      this._loadingElement.style.display = 'block';
      if (!this._loadingConfig?.html) this._loadingElement.textContent = this._loadingConfig?.text || 'Loading';
    }
  }

  private hideLoading() {
    if (this._toggleButton) {
      this._toggleButton.elementRef.classList.remove(OpenAIRealtimeIO.BUTTON_LOADING);
      ButtonAccessibility.removeAriaBusy(this._toggleButton.elementRef);
    }
    if (this._loadingElement) {
      this._loadingElement.style.display = 'none';
    }
  }

  // https://platform.openai.com/docs/guides/realtime-model-capabilities#function-calling
  private async handleTool(name: string, functionArguments: string, call_id: string, dc: RTCDataChannel) {
    if (!this._functionHandler) {
      // WORK - change
      throw Error(
        'Please define the `function_handler` property inside' +
          ' the [openAI](https://deepchat.dev/docs/directConnection/openAI#Realtime) object.'
      );
    }
    const result = await this._functionHandler({name, arguments: functionArguments});
    if (typeof result !== 'object' || !ObjectUtils.isJson(result)) {
      throw Error('The `function_handler` response must be a JSON object, e.g. {response: "My response"}');
    }
    if (name === 'generate_horoscope') {
      const eventMessage = JSON.stringify({
        type: 'conversation.item.create',
        item: {
          type: 'function_call_output',
          call_id,
          output: JSON.stringify(result),
        },
      });
      dc.send(eventMessage);
      const responseCreatePayload = {
        type: 'response.create',
      };
      dc.send(JSON.stringify(responseCreatePayload));
    }
  }

  override isCustomView() {
    return true;
  }
}
