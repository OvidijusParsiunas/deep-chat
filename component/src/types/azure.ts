import {ServiceCallConfig} from './requestSettings';

// eslint-disable-next-line max-len
// https://learn.microsoft.com/en-GB/azure/cognitive-services/speech-service/language-support?tabs=tts
// https://speech.microsoft.com/portal/voicegallery
// https://learn.microsoft.com/en-GB/azure/cognitive-services/speech-service/rest-text-to-speech?tabs=streaming
export interface AzureTextToSpeechConfig {
  outputFormat?: string;
  lang?: string;
  gender?: string;
  name?: string;
}

export interface AzureRegion {
  region: string;
}

export interface Azure {
  textToSpeech?: AzureRegion & AzureTextToSpeechConfig & ServiceCallConfig;
}
