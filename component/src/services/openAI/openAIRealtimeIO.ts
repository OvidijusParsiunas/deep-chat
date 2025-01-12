import {DirectConnection} from '../../types/directConnection';
import {DirectServiceIO} from '../utils/directServiceIO';
import {ChatFunctionHandler} from '../../types/openAI';
import {OpenAIUtils} from './utils/openAIUtils';
import {DeepChat} from '../../deepChat';

export class OpenAIRealtimeIO extends DirectServiceIO {
  override insertKeyPlaceholderText = 'OpenAI API Key';
  override keyHelpUrl = 'https://platform.openai.com/account/api-keys';
  url = 'https://api.openai.com/v1/chat/completions';
  permittedErrorPrefixes = ['Incorrect'];
  _functionHandler?: ChatFunctionHandler;
  asyncCallInProgress = false; // used when streaming tools

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = JSON.parse(JSON.stringify(deepChat.directConnection)) as DirectConnection;
    const apiKey = directConnectionCopy.openAI;
    super(deepChat, OpenAIUtils.buildKeyVerificationDetails(), OpenAIUtils.buildHeaders, apiKey);
    this.maxMessages ??= -1;
    this.rawBody.model ??= 'gpt-4o';
    this.init();
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
    pc.ontrack = (e) => (audioEl.srcObject = e.streams[0]);

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
      if (response.type === 'response.audio_transcript.delta') {
        console.log(response.delta);
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
}
