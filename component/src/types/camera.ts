import {GenericButton} from './button';
import {CustomStyle} from './styles';

export interface CameraDimensions {
  width?: number;
  height?: number;
}

export type PhotoFormat = 'png' | 'jpeg';

export interface ExistingServiceCameraConfig {
  camera?:
    | boolean
    | {
        button?: GenericButton;
        newFilePrefix?: string;
        modalContainerStyle?: CustomStyle;
      };
}
