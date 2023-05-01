import {AudioFileAttachmentType} from '../../fileAttachments/fileAttachmentTypes/audioFileAttachmentType';
import {RecordAudioFilesServiceConfig} from '../../../../../types/fileService';
import {NewFileName} from '../../fileAttachments/newFileName';
import {AudioFormat} from '../../../../../types/microphone';
import {MicrophoneButton} from './microphoneButton';

export class RecordAudio extends MicrophoneButton {
  private _mediaRecorder?: MediaRecorder;
  private _mediaStream?: MediaStream;
  private readonly _audioType: AudioFileAttachmentType;
  private readonly _extension: AudioFormat;

  constructor(audioType: AudioFileAttachmentType, recordAudioConfig: RecordAudioFilesServiceConfig) {
    super(recordAudioConfig.button);
    this._audioType = audioType;
    this._extension = recordAudioConfig.files?.format || 'mp3';
    this.elementRef.onclick = this.buttonClick.bind(this);
  }

  private buttonClick() {
    if (this.isActive) {
      this.stop();
    } else {
      this.record();
      this.changeToActive();
    }
  }

  private stop() {
    this.changeToDefault();
    this._mediaRecorder?.stop(); // may not be required
    this._mediaStream?.getTracks().forEach((track) => track.stop()); // necessary to remove tab bubble
  }

  private record() {
    navigator.mediaDevices
      .getUserMedia({audio: true})
      .then((stream) => {
        this._mediaRecorder = new MediaRecorder(stream);
        this._audioType.addPlaceholderAttachment();
        // fired on recording stop
        this._mediaStream = stream;
        this._mediaRecorder.addEventListener('dataavailable', (event) => {
          const blob = new Blob([event.data], {type: `audio/${this._extension}`});
          const filename = NewFileName.getFileName('audio', this._extension);
          const file = new File([blob], filename, {type: blob.type});
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = (event) => {
            this._audioType.completePlaceholderAttachment(file, (event.target as FileReader).result as string);
          };
        });

        this._mediaRecorder.start();
      })
      .catch((err) => {
        console.error(err);
        this.stop();
      });
  }
}
