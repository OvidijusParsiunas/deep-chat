import {AudioFormat} from './microphone';

export interface AudioRecordingFiles {
  format?: AudioFormat;
  acceptedFormats?: string; // for drag and drop -> overwritten by audio button if available
  newFilePrefix?: string;
  maxNumberOfFiles?: number;
  maxDurationSeconds?: number;
}
