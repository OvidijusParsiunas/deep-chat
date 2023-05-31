import {AudioRecordingFiles} from './audioRecordingFiles';
import {RequestSettings} from './requestSettings';
import {FileAttachments} from './fileAttachments';
import {MicrophoneStyles} from './microphone';
import {CameraFiles} from './camera';
import {CustomStyle} from './styles';
import {Button} from './button';

export type FilesConfig = {files?: FileAttachments; button?: Button};

export type FilesServiceConfig = {request?: RequestSettings} & FilesConfig;

export type CameraFilesServiceConfig = {
  request?: RequestSettings;
  files?: CameraFiles;
  button?: Button;
  modalContainerStyle?: CustomStyle;
};

export type RecordAudioFilesServiceConfig = {
  request?: RequestSettings;
  files?: AudioRecordingFiles;
  button?: MicrophoneStyles;
};
