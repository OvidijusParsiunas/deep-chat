import {FilesConfig} from './fileServiceConfigs';
import {CustomStyle} from './styles';
import {Button} from './button';

export interface CameraDimensions {
  width?: number;
  height?: number;
}

export type PhotoFormat = 'png' | 'jpeg';

export type ImagesWithCameraConfig = FilesConfig & {
  camera?: true | {button?: Button; modalContainerStyle?: CustomStyle; format?: PhotoFormat};
};
