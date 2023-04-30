import {AddErrorMessage, SpeechToText} from './speechToText';
import {ServiceIO} from '../../../../../services/serviceIO';
import {AiAssistant} from '../../../../../aiAssistant';
import {MicrophoneButton} from './microphoneButton';
import {RecordAudio} from './recordAudio';

export class MicrophoneButtonFactory {
  // prettier-ignore
  public static attemptCreate(aiAssistant: AiAssistant, serviceIO: ServiceIO, inputElement: HTMLElement,
      addErrorMessage: AddErrorMessage): MicrophoneButton | undefined {
    if (serviceIO.microphone) {
      return new RecordAudio(serviceIO.microphone);
    }
    if (aiAssistant.speechInput) {
      return new SpeechToText(aiAssistant.speechInput, inputElement, addErrorMessage);
    }
    return undefined;
  }
}
