import {TextToSpeechConfig} from '../../../../types/textToSpeech';

export type ProcessedTextToSpeechConfig = {
  lang?: string;
  // https://developer.mozilla.org/docs/Web/API/SpeechSynthesisUtterance/pitch)
  pitch?: number;
  // https://developer.mozilla.org/docs/Web/API/SpeechSynthesisUtterance/rate)
  rate?: number;
  // https://developer.mozilla.org/docs/Web/API/SpeechSynthesisUtterance/voice)
  // to get the full list use - window.speechSynthesis.getVoices()
  voice?: SpeechSynthesisVoice;
  // https://developer.mozilla.org/docs/Web/API/SpeechSynthesisUtterance/volume)
  volume?: number;
};

export class TextToSpeech {
  private static readonly LOAD_VOICES_MS = 200;

  public static speak(text: string, config: ProcessedTextToSpeechConfig) {
    if (window.SpeechSynthesisUtterance) {
      const utterance = new SpeechSynthesisUtterance(text);
      Object.assign(utterance, config);
      speechSynthesis.speak(utterance);
    }
  }

  public static processConfig(config: boolean | TextToSpeechConfig, set: (config: ProcessedTextToSpeechConfig) => void) {
    const processedConfig: ProcessedTextToSpeechConfig = {};
    window.speechSynthesis; // this is required for the browser to start loading voices
    setTimeout(() => {
      if (typeof config === 'object') {
        if (config.lang) processedConfig.lang = config.lang;
        if (config.pitch) processedConfig.pitch = config.pitch;
        if (config.rate) processedConfig.rate = config.rate;
        if (config.volume) processedConfig.volume = config.volume;
        if (config.voiceName) {
          const voice = window.speechSynthesis.getVoices().find((voice) => {
            return voice.name.toLocaleLowerCase() === config.voiceName?.toLocaleLowerCase();
          });
          if (voice) processedConfig.voice = voice;
        }
      }
      set(processedConfig);
    }, TextToSpeech.LOAD_VOICES_MS);
  }
}
