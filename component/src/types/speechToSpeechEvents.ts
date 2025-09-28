import {OnMessage} from './messages';

export interface SpeechToSpeechEvents {
  started?: () => void;
  stopped?: () => void;
  onMessage?: OnMessage;
}
