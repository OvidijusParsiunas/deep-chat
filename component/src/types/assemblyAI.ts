import {ServiceCallConfig} from './requestSettings';
import {AudioFiles} from './microphone';

export interface AssemblyAI {
  audio?: true | (ServiceCallConfig & AudioFiles);
}
