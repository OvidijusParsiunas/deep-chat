import {ServiceCallConfig} from './requestSettings';
import {FileAttachments} from './fileAttachments';
import {GenericButton} from './button';
import {CustomStyle} from './styles';
import {CameraFiles} from './camera';

export type FilesServiceConfig = ServiceCallConfig & {files?: FileAttachments; button?: GenericButton};

export type CameraFilesServiceConfig = ServiceCallConfig & {
  files?: CameraFiles;
  button?: GenericButton;
  modalContainerStyle?: CustomStyle;
};
