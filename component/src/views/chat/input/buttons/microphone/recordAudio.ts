import {Microphone} from '../../../../../types/microphone';
import {MicrophoneButton} from './microphoneButton';
import {AddErrorMessage} from './speechToText';

export class RecordAudio extends MicrophoneButton {
  private _mediaRecorder?: MediaRecorder;

  constructor(inputElement: HTMLElement, addErrorMessage: AddErrorMessage, microphone: Microphone) {
    super(inputElement, addErrorMessage, microphone);
    this.elementRef.onclick = this.buttonClick.bind(this);
  }

  private static getFileName() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `recording-${hours}-${minutes}-${seconds}.mp3`;
  }

  buttonClick() {
    if (this.isActive) {
      this.changeToDefault();
      this._mediaRecorder?.stop();
    } else {
      navigator.mediaDevices.getUserMedia({audio: true}).then((stream) => {
        this._mediaRecorder = new MediaRecorder(stream);
        // api for max recorded time length
        // api for file type
        // fired when stop called
        this._mediaRecorder.addEventListener('dataavailable', (event) => {
          const blob = new Blob([event.data], {type: 'audio/mp3'});
          const url = URL.createObjectURL(blob);
          const audio = new Audio(url);
          audio.play();
          const filename = RecordAudio.getFileName();
          return new File([blob], filename, {type: blob.type});
        });

        this._mediaRecorder.start();
      });
      this.changeToActive();
    }
  }
}
