import {OpenAIRealTime, OpenAIRealtimeButton as OpenAIRealtimeButtonT} from '../../types/openAIRealtime';
import {OpenAIRealtimeButton} from './realtime/openAIRealtimeButton';
import {DirectConnection} from '../../types/directConnection';
import {MICROPHONE_ICON_STRING} from '../../icons/microphone';
import avatarUrl from '../../../assets/person-avatar.png';
import {DirectServiceIO} from '../utils/directServiceIO';
import {ChatFunctionHandler} from '../../types/openAI';
import {OpenAIUtils} from './utils/openAIUtils';
import {APIKey} from '../../types/APIKey';
import {DeepChat} from '../../deepChat';

export class OpenAIRealtimeIO extends DirectServiceIO {
  override insertKeyPlaceholderText = 'OpenAI API Key';
  override keyHelpUrl = 'https://platform.openai.com/account/api-keys';
  url = 'https://api.openai.com/v1/chat/completions';
  permittedErrorPrefixes = ['Incorrect'];
  _functionHandler?: ChatFunctionHandler;
  asyncCallInProgress = false; // used when streaming tools
  private readonly _avatarConfig: OpenAIRealTime['avatar'];
  private readonly _avatarMaxScale: number = 2.5;
  private readonly _microphoneConfig: OpenAIRealtimeButtonT;
  private readonly _toggleConfig: OpenAIRealtimeButtonT;
  private readonly _avatarEl: HTMLImageElement;
  private readonly _containerEl: HTMLDivElement;

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = JSON.parse(JSON.stringify(deepChat.directConnection)) as DirectConnection;
    const {key} = directConnectionCopy.openAI as APIKey;
    super(deepChat, OpenAIUtils.buildKeyVerificationDetails(), OpenAIUtils.buildHeaders, {key: key || 'asdsd'});
    const config = directConnectionCopy.openAI?.realtime as OpenAIRealTime;
    if (typeof config === 'object') {
      this._avatarConfig = config.avatar;
    }
    this._microphoneConfig = OpenAIRealtimeIO.buildMicrophoneConfig(config);
    this._toggleConfig = OpenAIRealtimeIO.buildToggleConfig(config);
    this.rawBody.model ??= 'gpt-4o';
    this._avatarEl = OpenAIRealtimeIO.createAvatar(this._avatarConfig);
    this._containerEl = this.createContainer();
    if (this._avatarConfig?.maxScale && this._avatarConfig.maxScale >= 1) {
      this._avatarMaxScale = this._avatarConfig.maxScale;
    }
    this.init();
  }

  private static buildMicrophoneConfig(config?: OpenAIRealTime) {
    const newConfig =
      typeof config === 'object' && config.buttons?.microphone ? structuredClone(config.buttons?.microphone) : {};
    if (!newConfig.default?.text?.content) {
      newConfig.default ??= {};
      newConfig.default.svg ??= {};
      newConfig.default.svg.content = MICROPHONE_ICON_STRING;
    }
    return newConfig;
  }

  private static buildToggleConfig(config?: OpenAIRealTime) {
    const newConfig = typeof config === 'object' && config.buttons?.toggle ? structuredClone(config.buttons?.toggle) : {};
    if (!newConfig.default?.text?.content) {
      newConfig.default ??= {};
      newConfig.default.svg ??= {};
      newConfig.default.svg.content = MICROPHONE_ICON_STRING;
    }
    return newConfig;
  }

  private createContainer() {
    const container = document.createElement('div');
    container.id = 'deep-chat-openai-realtime-container';
    container.appendChild(this.createAvatarContainer());
    container.appendChild(this.createOptionsContainer());
    return container;
  }

  public setUpView(oldContainerElement: HTMLElement, parentElement: HTMLElement) {
    oldContainerElement.style.display = 'none';
    parentElement.appendChild(this._containerEl);
  }

  private createOptionsContainer() {
    const optionsContainer = document.createElement('div');
    optionsContainer.id = 'deep-chat-openai-options-container';
    const muteOption = OpenAIRealtimeIO.createOptionContainer(this.createMuteButton());
    const muteOption2 = OpenAIRealtimeIO.createOptionContainer(this.createToggleButton());
    optionsContainer.appendChild(muteOption);
    optionsContainer.appendChild(muteOption2);
    return optionsContainer;
  }

  private static createOptionContainer(optionChildElement: HTMLElement) {
    const optionContainer = document.createElement('div');
    optionContainer.classList.add('deep-chat-openai-option-container');
    optionContainer.appendChild(optionChildElement);
    return optionContainer;
  }

  private createMuteButton() {
    const realtimeButton = new OpenAIRealtimeButton(this._microphoneConfig);
    realtimeButton.elementRef.classList.replace('input-button-svg', 'deep-chat-openai-option-button');
    realtimeButton.elementRef.children[0].id = 'deep-chat-openai-realtime-mute';
    return realtimeButton.elementRef;
  }

  private createToggleButton() {
    const realtimeButton = new OpenAIRealtimeButton(this._toggleConfig);
    realtimeButton.elementRef.classList.replace('input-button-svg', 'deep-chat-openai-option-button');
    realtimeButton.elementRef.children[0].id = 'deep-chat-openai-realtime-mute';
    return realtimeButton.elementRef;
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

  private async init() {
    // Get an ephemeral key from your server - see server code below
    // const tokenResponse = await fetch('/session');
    // const data = await tokenResponse.json();
    const EPHEMERAL_KEY = 'key';

    // Create a peer connection
    const pc = new RTCPeerConnection();

    // Set up to play remote audio from the model
    const audioEl = document.createElement('audio');
    audioEl.autoplay = true;
    const audioContext = new AudioContext();

    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256; // Determines frequency resolution
    const frequencyData = new Uint8Array(analyser.frequencyBinCount);

    // Monitor when tracks are added to the peer connection
    pc.ontrack = async (e) => {
      if (e.streams[0]) {
        audioEl.srcObject = e.streams[0];

        const source = audioContext.createMediaStreamSource(e.streams[0]);
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
          console.log('AudioContext resumed');
        }
        source.connect(analyser);
        this.monitorFrequencies(analyser, frequencyData);
      } else {
        console.error('No streams found in the ontrack event.');
      }
    };

    // Add local audio track for microphone input in the browser
    const ms = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    pc.addTrack(ms.getTracks()[0]);

    // Set up data channel for sending and receiving events
    const dc = pc.createDataChannel('oai-events');
    dc.addEventListener('message', (e) => {
      // Realtime server events appear here!
      const response = JSON.parse(e.data);
      // console.log(response);
      if (response.type === 'response.audio_transcript.delta') {
        // console.log(response.delta);
      }
    });

    // Start the session using the Session Description Protocol (SDP)
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    const baseUrl = 'https://api.openai.com/v1/realtime';
    const model = 'gpt-4o-realtime-preview-2024-12-17';
    const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
      method: 'POST',
      body: offer.sdp,
      headers: {
        Authorization: `Bearer ${EPHEMERAL_KEY}`,
        'Content-Type': 'application/sdp',
      },
    });

    const answer: RTCSessionDescriptionInit = {
      type: 'answer',
      sdp: await sdpResponse.text(),
    };
    await pc.setRemoteDescription(answer);
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

      const hasAudio = frequencyData.some((value) => value > 0);
      if (hasAudio) console.log('Non-zero frequency data detected');

      // Update the avatar scale
      const minScale = 1;
      const scale = minScale + (normalizedLoudness / 100) * (this._avatarMaxScale - minScale);
      this._avatarEl.style.transform = `scale(${scale})`;

      requestAnimationFrame(updateFrequencyData);
    };

    updateFrequencyData();
  }

  override isCustomView() {
    return true;
  }
}
