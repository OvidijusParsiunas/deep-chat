import {AudioRecordingFiles, MicrophoneStyles} from './microphone';
import {RequestSettings} from './requestSettings';
import {FileAttachments} from './fileAttachments';
import {CameraFiles} from './camera';
import {CustomStyle} from './styles';
import {Button} from './button';

export type FilesUploader = {files?: FileAttachments; button?: Button};

export type FilesServiceConfig = {request?: RequestSettings} & FilesUploader;

export type CameraFilesServiceConfig = {
  request?: RequestSettings;
  files?: CameraFiles;
  button?: Button;
  modalContainerStyle?: CustomStyle;
};

export type MicrophoneFilesServiceConfig = {
  request?: RequestSettings;
  files?: AudioRecordingFiles;
  button?: MicrophoneStyles;
};
