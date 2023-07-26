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

export type SpeechToTextConfig = {
  webSpeech?: true | WebSpeechOptions;
  azure?: true | AzureOptions;
  displayInterimResults?: boolean;
  textColor?: TextColor;
  stopAfterSilenceMS?: number;
  translations?: Translations;
  // please note that it ise best to set submit property with 'send' because webspeech recognises submit after sub
  // and the word sub is sent
  commands?: Commands & {submit?: string};
  commandModeStyles?: ButtonStyles;
} & MicrophoneStyles;
