import {AudioRecordingFiles, MicrophoneStyles} from './microphone';
import {FileAttachments} from './fileAttachments';
import {CameraFiles} from './camera';
import {CustomStyle} from './styles';
import {Connect} from './connect';
import {Button} from './button';

export type FilesServiceConfig = {connect?: Connect; files?: FileAttachments; button?: Button};

export type CameraFilesServiceConfig = {
  connect?: Connect;
  files?: CameraFiles;
  button?: Button;
  modalContainerStyle?: CustomStyle;
};

export type MicrophoneFilesServiceConfig = {
  connect?: Connect;
  files?: AudioRecordingFiles;
  button?: MicrophoneStyles;
};
