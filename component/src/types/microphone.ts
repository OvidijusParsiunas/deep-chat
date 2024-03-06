import {AzureOptions, Commands, TextColor, Translations, WebSpeechOptions} from 'speech-to-element/dist/types/options';
import {ButtonStyles, ButtonPosition} from './button';

export interface MicrophoneStyles {
  default?: ButtonStyles;
  active?: ButtonStyles;
  unsupported?: ButtonStyles;
  position?: ButtonPosition;
}

export type AudioFormat = 'mp3' | '4a' | 'webm' | 'mp4' | 'mpga' | 'wav' | 'mpeg' | 'm4a';

export interface AudioRecordingFiles {
  format?: AudioFormat;
  acceptedFormats?: string; // for drag and drop -> overwritten by audio button if available
  maxNumberOfFiles?: number;
  maxDurationSeconds?: number;
}

export type SubmitAfterSilence = true | number;

export type SpeechToTextConfig = {
  webSpeech?: true | WebSpeechOptions;
  azure?: AzureOptions;
  displayInterimResults?: boolean;
  textColor?: TextColor;
  translations?: Translations;
  commands?: Commands & {submit?: string};
  stopAfterSubmit?: false;
  submitAfterSilence?: SubmitAfterSilence;
  button?: {commandMode?: ButtonStyles} & MicrophoneStyles; // TO-DO - potentially include a pause style
};
