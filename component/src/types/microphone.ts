import {WebSpeechOptions, AzureOptions, Translations, TextColor, Commands} from 'speech-to-element/dist/types/options';
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

export interface SpeechEvents {
  onStart?: () => void;
  onStop?: () => void;
  onResult?: (text: string, isFinal: boolean) => void;
  onPreResult?: (text: string, isFinal: boolean) => void;
  onCommandModeTrigger?: (isStart: boolean) => void;
  onPauseTrigger?: (isStart: boolean) => void;
}

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
  events?: SpeechEvents;
  /**
   * @description Callback function to handle the recorded audio blob externally.
   * If provided, Deep Chat will capture audio and pass the resulting Blob to this handler
   * instead of using internal or Azure STT services.
   */
  externalHandler?: (audioBlob: Blob) => void;
  /**
   * @description Specifies the desired audio format for the blob passed to the externalHandler.
   * @default 'wav'
   */
  externalAudioFormat?: 'wav' | 'mp3' | 'ogg';
};
