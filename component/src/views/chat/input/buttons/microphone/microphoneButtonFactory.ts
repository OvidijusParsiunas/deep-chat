import {ServiceIO} from '../../../../../services/serviceIO';
import {AiAssistant} from '../../../../../aiAssistant';
import {MicrophoneButton} from './microphoneButton';
import {AddErrorMessage} from './speechToText';
import {RecordAudio} from './recordAudio';

export class MicrophoneButtonFactory {
  // prettier-ignore
  public static attemptCreate(aiAssistant: AiAssistant, serviceIO: ServiceIO, inputElement: HTMLElement,
      addErrorMessage: AddErrorMessage): MicrophoneButton | undefined {
    if (serviceIO.microphone) {
      return new RecordAudio(inputElement, addErrorMessage, serviceIO.microphone);
    }
    if (aiAssistant.speechInput) {
      return new MicrophoneButton(inputElement, addErrorMessage, aiAssistant.speechInput);
    }
    return undefined;
  }
}
