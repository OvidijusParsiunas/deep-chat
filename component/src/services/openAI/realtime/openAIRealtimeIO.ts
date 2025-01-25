import {OpenAIRealTime, OpenAIRealtimeButton as OpenAIRealtimeButtonT} from '../../../types/openAIRealtime';
import {DirectConnection} from '../../../types/directConnection';
import {MICROPHONE_ICON_STRING} from '../../../icons/microphone';
import avatarUrl from '../../../../assets/person-avatar.png';
import {OpenAIRealtimeButton} from './openAIRealtimeButton';
import {DirectServiceIO} from '../../utils/directServiceIO';
import {ChatFunctionHandler} from '../../../types/openAI';
import {PLAY_ICON_STRING} from '../../../icons/playIcon';
import {STOP_ICON_STRING} from '../../../icons/stopIcon';
import {OpenAIUtils} from '../utils/openAIUtils';
import {APIKey} from '../../../types/APIKey';
import {DeepChat} from '../../../deepChat';

export class OpenAIRealtimeIO extends DirectServiceIO {
  override insertKeyPlaceholderText = 'OpenAI API Key';
  override keyHelpUrl = 'https://platform.openai.com/account/api-keys';
  url = 'https://api.openai.com/v1/chat/completions';
  permittedErrorPrefixes = ['Incorrect'];
  _functionHandler?: ChatFunctionHandler;
  asyncCallInProgress = false; // used when streaming tools
  private readonly _avatarConfig: OpenAIRealTime['avatar'];
  private readonly _buttonsConfig: OpenAIRealTime['buttons'];
  private readonly _avatarEl: HTMLImageElement;
  private readonly _containerEl: HTMLDivElement;
  private readonly _deepChat: DeepChat;
  private _muteButton: OpenAIRealtimeButton | null = null;
  private _toggleButton: OpenAIRealtimeButton | null = null;
  private _pc: RTCPeerConnection | null = null;
  private _mediaStream: MediaStream | null = null;
  private _isMuted = false;
  private _ephemeralKey?: string;
  private _retrievingEphemeralKey?: Promise<string>;
  private static readonly BUTTON_DEFAULT = 'deep-chat-openai-realtime-button-default';
  private static readonly BUTTON_LOADING = 'deep-chat-openai-realtime-button-loading';
  private static readonly MUTE_ACTIVE = 'deep-chat-openai-realtime-mute-active';
  private static readonly INACTIVE = 'deep-chat-openai-realtime-button-unavailable';

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = JSON.parse(JSON.stringify(deepChat.directConnection)) as DirectConnection;
    const key = OpenAIRealtimeIO.getKey(deepChat);
    super(deepChat, OpenAIUtils.buildKeyVerificationDetails(), OpenAIUtils.buildHeaders, {key});
    const config = directConnectionCopy.openAI?.realtime as OpenAIRealTime;
    if (typeof config === 'object') {
      this._avatarConfig = config.avatar;
      this._ephemeralKey = config.ephemeralKey;
      Object.assign(this.rawBody, config.config);
    }
    this.rawBody.model ??= 'gpt-4o-realtime-preview-2024-12-17';
    this._avatarConfig = OpenAIRealtimeIO.buildAvatarConfig(config);
    this._buttonsConfig = OpenAIRealtimeIO.buildButtonsConfig(config);
    this._avatarEl = OpenAIRealtimeIO.createAvatar(this._avatarConfig);
    this._containerEl = this.createContainer();
    this._deepChat = deepChat;
    this.setup();
  }

  private static getKey(deepChat: DeepChat) {
    const openAI = (deepChat.directConnection as DirectConnection).openAI;
    if (openAI?.key) return openAI.key;
    const openAIRealtime = openAI?.realtime;
    if (typeof openAIRealtime === 'object' && (openAIRealtime.ephemeralKey || openAIRealtime.retrieveEphemeralKey)) {
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
    const retrieveEphemeralKey = typeof openAI?.realtime === 'object' ? openAI?.realtime.retrieveEphemeralKey : undefined;
    const config = openAI?.realtime as OpenAIRealTime;
    const key = this.key || (openAI as APIKey).key;
    if (typeof config === 'object') {
      if (!this._ephemeralKey) {
        if ((retrieveEphemeralKey || key) && config.autoStart) this.changeToUnavailable();
        if (retrieveEphemeralKey) {
          const retrievingEphemeralKey = retrieveEphemeralKey();
          if ((retrievingEphemeralKey as Promise<string>).then) {
            this._retrievingEphemeralKey = retrievingEphemeralKey as Promise<string>;
          }
          this._ephemeralKey = await retrievingEphemeralKey;
        } else if (key) {
          this._retrievingEphemeralKey = this.getEphemeralKey(key);
          this._ephemeralKey = await this._retrievingEphemeralKey;
        }
      }
      if (this._ephemeralKey) {
        this.changeToAvailable();
        if (config.autoStart) this.init(this._ephemeralKey);
      }
    } else {
      if (key) {
        this._retrievingEphemeralKey = this.getEphemeralKey(key);
        this._ephemeralKey = await this._retrievingEphemeralKey;
      }
    }
  }

  private async getEphemeralKey(key: string) {
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
    const newConfig = typeof config === 'object' && config.avatar ? structuredClone(config.avatar) : {};
    newConfig.maxScale = newConfig.maxScale && newConfig.maxScale >= 1 ? newConfig.maxScale : 2.5;
    return newConfig;
  }

  private static buildButtonsConfig(config?: OpenAIRealTime) {
    const newConfig = typeof config === 'object' && config.buttons ? structuredClone(config.buttons) : {};
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
    // OpenAIRealtimeIO.changeButtonToUnavailable(muteButton);
    muteButton.elementRef.onclick = () => {
      if (muteButton.isActive) {
        this.toggleMute(true);
        muteButton.elementRef.classList.replace(OpenAIRealtimeIO.MUTE_ACTIVE, OpenAIRealtimeIO.BUTTON_DEFAULT);
        muteButton.changeToDefault();
        this._isMuted = false;
      } else {
        this.toggleMute(false);
        muteButton.elementRef.classList.replace(OpenAIRealtimeIO.BUTTON_DEFAULT, OpenAIRealtimeIO.MUTE_ACTIVE);
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
    // OpenAIRealtimeIO.changeButtonToUnavailable(toggleButton);
    toggleButton.elementRef.onclick = async () => {
      if (toggleButton.isActive) {
        toggleButton.changeToDefault();
        this._mediaStream?.getTracks().forEach((track) => track.stop());
        this._mediaStream = null;
        if (this._pc) {
          this._pc.close();
          this._pc = null;
        }
      } else {
        try {
          if (this._ephemeralKey) {
            await this.init(this._ephemeralKey);
          } else if (this._retrievingEphemeralKey) {
            this._toggleButton?.changeToActive();
            this._toggleButton?.elementRef.classList.add(OpenAIRealtimeIO.BUTTON_LOADING);
            const ephemeralKey = await this._retrievingEphemeralKey;
            await this.init(ephemeralKey);
          }
        } catch (error) {
          console.error('Failed to start conversation:', error);
          toggleButton.changeToUnavailable();
        }
        toggleButton.elementRef.classList.remove(OpenAIRealtimeIO.BUTTON_LOADING);
      }
    };
    return toggleButton;
  }

  private async init(ephemeralKey: string) {
    this._toggleButton?.changeToActive();
    this._toggleButton?.elementRef.classList.add(OpenAIRealtimeIO.BUTTON_LOADING);
    // Create a peer connection
    this._pc = new RTCPeerConnection();

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
      }
    };

    // Add local audio track for microphone input in the browser
    await navigator.mediaDevices
      .getUserMedia({
        audio: true,
      })
      .then((stream) => {
        this._mediaStream = stream;
        this._pc?.addTrack(this._mediaStream.getTracks()[0]);
        if (this._isMuted) this.toggleMute(false);
      })
      .catch((error) => {
        console.error('Error accessing microphone:', error);
      });

    // Set up data channel for sending and receiving events
    // const dc = this._pc.createDataChannel('oai-events');
    // dc.addEventListener('message', (e) => {
    //   // Realtime server events appear here!
    //   const response = JSON.parse(e.data);
    //   if (response.type === 'response.audio_transcript.delta') {
    //     // console.log(response.delta);
    //   }
    // });

    // Start the session using the Session Description Protocol (SDP)
    const offer = await this._pc.createOffer();
    await this._pc.setLocalDescription(offer);
    const sdpResponse = await fetch(`https://api.openai.com/v1/realtime?model=${this.rawBody.model}`, {
      method: 'POST',
      body: offer.sdp,
      headers: {
        Authorization: `Bearer ${ephemeralKey}`,
        'Content-Type': 'application/sdp',
      },
    });

    this._toggleButton?.elementRef.classList.remove(OpenAIRealtimeIO.BUTTON_LOADING);
    const answer: RTCSessionDescriptionInit = {
      type: 'answer',
      sdp: await sdpResponse.text(),
    };
    if (this._pc) await this._pc.setRemoteDescription(answer);
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

  private changeToUnavailable() {
    if (this._muteButton) OpenAIRealtimeIO.changeButtonToUnavailable(this._muteButton);
    if (this._toggleButton) OpenAIRealtimeIO.changeButtonToUnavailable(this._toggleButton);
  }

  private static changeButtonToUnavailable(button: OpenAIRealtimeButton) {
    button.elementRef.classList.add(OpenAIRealtimeIO.INACTIVE);
    button.changeToUnavailable();
  }

  private changeToAvailable() {
    if (this._muteButton) OpenAIRealtimeIO.changeButtonToAvailable(this._muteButton);
    if (this._toggleButton) OpenAIRealtimeIO.changeButtonToAvailable(this._toggleButton);
  }

  private static changeButtonToAvailable(button: OpenAIRealtimeButton) {
    button.elementRef.classList.remove(OpenAIRealtimeIO.INACTIVE);
    button.changeToDefault();
  }

  override isCustomView() {
    return true;
  }
}
