import {FilesUploader} from './fileServiceConfigs';
import {CustomStyle} from './styles';
import {Button} from './button';

export interface CameraDimensions {
  width?: number;
  height?: number;
}

export type PhotoFormat = 'png' | 'jpeg';

export interface CameraFiles {
  maxNumberOfFiles?: number;
  acceptedFormats?: string; // for drag and drop -> overwritten by image button if available
  format?: PhotoFormat;
  dimensions?: CameraDimensions;
}

export type ImageFiles = FilesUploader & {
  camera?: true | {button?: Button; modalContainerStyle?: CustomStyle; format?: PhotoFormat};
};
