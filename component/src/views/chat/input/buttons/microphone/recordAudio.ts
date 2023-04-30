import {FileAttachmentsType} from '../../fileAttachments/fileAttachmentsType';
import {FileAttachments} from '../../fileAttachments/fileAttachments';
import {MicrophoneStyles} from '../../../../../types/microphone';
import {NewFileName} from '../../fileAttachments/newFileName';
import {MicrophoneButton} from './microphoneButton';

export class RecordAudio extends MicrophoneButton {
  private _mediaRecorder?: MediaRecorder;

  constructor(audioType: FileAttachmentsType, styles?: MicrophoneStyles) {
    super(styles);
    this.elementRef.onclick = this.buttonClick.bind(this, audioType);
  }

  private buttonClick(audioType: FileAttachmentsType) {
    if (this.isActive) {
      this.changeToDefault();
      this._mediaRecorder?.stop();
    } else {
      this.record(audioType);
      this.changeToActive();
    }
  }

  private record(audioType: FileAttachmentsType) {
    navigator.mediaDevices.getUserMedia({audio: true}).then((stream) => {
      this._mediaRecorder = new MediaRecorder(stream);
      // fired when stop called
      this._mediaRecorder.addEventListener('dataavailable', (event) => {
        const blob = new Blob([event.data], {type: 'audio/mp3'});
        const filename = NewFileName.getFileName('audio', 'mp3');
        const file = new File([blob], filename, {type: blob.type});
        if (file) FileAttachments.addFilesToType([file], [audioType]);
      });

      this._mediaRecorder.start();
    });
  }
}
