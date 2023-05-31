import {AudioWithMicrophoneConfig} from './microphone';
import {ServiceCallConfig} from './requestSettings';
import {Key} from './key';

export interface AssemblyAI {
  audio?: true | (Key & ServiceCallConfig & AudioWithMicrophoneConfig);
}
