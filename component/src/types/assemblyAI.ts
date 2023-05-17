import {ExistingServiceAudioRecordingConfig} from './microphone';
import {Key} from './key';

export interface AssemblyAI {
  audio?: true | (Key & ExistingServiceAudioRecordingConfig);
}
