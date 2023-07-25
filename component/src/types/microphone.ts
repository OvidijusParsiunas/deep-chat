import {AzureOptions, TextColor, Translations, WebSpeechAPIOptions} from 'speech-to-element/dist/types/options';
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

export type SpeechToTextConfig = {
  webSpeech?: true | WebSpeechAPIOptions;
  azure?: true | AzureOptions;
  displayInterimResults?: boolean;
  textColor?: TextColor;
  stopAfterSilenceMS?: number;
  translations?: Translations;
} & MicrophoneStyles;
