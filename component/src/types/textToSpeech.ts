export interface ServiceAudioResponse {
  autoPlay?: boolean;
  displayAudio?: boolean;
  displayText?: boolean; // applies to services that offer transcript
}

export interface TextToSpeechConfig {
  // https://developer.mozilla.org/docs/Web/API/SpeechSynthesisUtterance/lang
  lang?: string;
  // https://developer.mozilla.org/docs/Web/API/SpeechSynthesisUtterance/pitch
  pitch?: number;
  // https://developer.mozilla.org/docs/Web/API/SpeechSynthesisUtterance/rate
  rate?: number;
  // https://developer.mozilla.org/docs/Web/API/SpeechSynthesisUtterance/voice
  // to get the full list use - window.speechSynthesis.getVoices()
  voiceName?: string;
  // https://developer.mozilla.org/docs/Web/API/SpeechSynthesisUtterance/volume
  volume?: number;
  audio?: ServiceAudioResponse;
}
