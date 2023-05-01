import {RecordAudioFilesServiceConfig} from '../../../../../types/fileService';
import {FileAttachmentsType} from '../../fileAttachments/fileAttachmentsType';
import {FileAttachments} from '../../fileAttachments/fileAttachments';
import {NewFileName} from '../../fileAttachments/newFileName';
import {AudioFormat} from '../../../../../types/microphone';
import {MicrophoneButton} from './microphoneButton';

export class RecordAudio extends MicrophoneButton {
  private _mediaRecorder?: MediaRecorder;
  private _mediaStream?: MediaStream;
  private readonly _extension: AudioFormat;

  constructor(audioType: FileAttachmentsType, recordAudioConfig: RecordAudioFilesServiceConfig) {
    super(recordAudioConfig.button);
    this._extension = recordAudioConfig.files?.format || 'mp3';
    this.elementRef.onclick = this.buttonClick.bind(this, audioType);
  }

  private buttonClick(audioType: FileAttachmentsType) {
    if (this.isActive) {
      this.changeToDefault();
      this._mediaRecorder?.stop(); // may not be required
      this._mediaStream?.getTracks().forEach((track) => track.stop()); // necessary to remove tab bubble
    } else {
      this.record(audioType);
      this.changeToActive();
    }
  }

  private record(audioType: FileAttachmentsType) {
    navigator.mediaDevices.getUserMedia({audio: true}).then((stream) => {
      this._mediaRecorder = new MediaRecorder(stream);
      // fired on recording stop
      this._mediaStream = stream;
      this._mediaRecorder.addEventListener('dataavailable', (event) => {
        const blob = new Blob([event.data], {type: `audio/${this._extension}`});
        const filename = NewFileName.getFileName('audio', this._extension);
        const file = new File([blob], filename, {type: blob.type});
        if (file) FileAttachments.addFilesToType([file], [audioType]);
      });

      this._mediaRecorder.start();
    });
  }
}
