import {ServiceRequestConfig} from './requestSettings';
import {FileAttachments} from './fileAttachments';
import {GenericButton} from './button';
import {CustomStyle} from './styles';
import {CameraFiles} from './camera';

export type FilesServiceConfig = ServiceRequestConfig & {files?: FileAttachments; button?: GenericButton};

export type CameraFilesServiceConfig = ServiceRequestConfig & {
  files?: CameraFiles;
  button?: GenericButton;
  modalContainerStyle?: CustomStyle;
};
