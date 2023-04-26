import {GenericButton} from './button';
import {CustomStyle} from './styles';

export interface CameraDimensions {
  width?: number;
  height?: number;
}

export type PhotoFormat = 'png' | 'jpeg';

export interface CameraFiles {
  maxNumberOfFiles?: number;
  format?: PhotoFormat;
  dimensions?: CameraDimensions;
}

export interface ExistingServiceCameraConfig {
  camera?:
    | boolean
    | {
        button?: GenericButton;
        modalContainerStyle?: CustomStyle;
      };
}
