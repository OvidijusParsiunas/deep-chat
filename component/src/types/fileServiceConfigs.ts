import {AudioRecordingFiles, MicrophoneStyles} from './microphone';
import {FileAttachments} from './fileAttachments';
import {CameraFiles} from './camera';
import {CustomStyle} from './styles';
import {Request} from './request';
import {Button} from './button';

export type FilesUploader = {files?: FileAttachments; button?: Button};

export type FilesServiceConfig = {request?: Request} & FilesUploader;

export type CameraFilesServiceConfig = {
  request?: Request;
  files?: CameraFiles;
  button?: Button;
  modalContainerStyle?: CustomStyle;
};

export type MicrophoneFilesServiceConfig = {
  request?: Request;
  files?: AudioRecordingFiles;
  button?: MicrophoneStyles;
};
