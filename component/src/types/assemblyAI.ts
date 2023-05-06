import {ExistingServiceAudioRecordingConfig} from './microphone';
import {FilesServiceConfig} from './fileServiceConfigs';

export interface AssemblyAI {
  audio?: true | (FilesServiceConfig & ExistingServiceAudioRecordingConfig);
}
