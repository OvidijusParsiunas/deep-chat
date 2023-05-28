import {AudioRecordingFiles} from './audioRecordingFiles';
import {ServiceCallConfig} from './requestSettings';
import {FileAttachments} from './fileAttachments';
import {MicrophoneStyles} from './microphone';
import {CameraFiles} from './cameraFiles';
import {CustomStyle} from './styles';
import {Button} from './button';

export type FilesServiceConfig = ServiceCallConfig & {files?: FileAttachments; button?: Button};

export type CameraFilesServiceConfig = ServiceCallConfig & {
  files?: CameraFiles;
  button?: Button;
  modalContainerStyle?: CustomStyle;
};

export type RecordAudioFilesServiceConfig = ServiceCallConfig & {
  files?: AudioRecordingFiles;
  button?: MicrophoneStyles;
};
