import {AudioRecordingFiles} from './audioRecordingFiles';
import {ServiceCallConfig} from './requestSettings';
import {FileAttachments} from './fileAttachments';
import {MicrophoneStyles} from './microphone';
import {CameraFiles} from './cameraFiles';
import {GenericButton} from './button';
import {CustomStyle} from './styles';

export type FilesServiceConfig = ServiceCallConfig & {files?: FileAttachments; button?: GenericButton};

export type CameraFilesServiceConfig = ServiceCallConfig & {
  files?: CameraFiles;
  button?: GenericButton;
  modalContainerStyle?: CustomStyle;
};

export type RecordAudioFilesServiceConfig = ServiceCallConfig & {
  files?: AudioRecordingFiles;
  button?: MicrophoneStyles;
};
