import {ExistingServiceAudioRecordingConfig} from './microphone';
import {GenericButton} from './button';
import {CustomStyle} from './styles';

export interface CameraDimensions {
  width?: number;
  height?: number;
}

export type PhotoFormat = 'png' | 'jpeg';

export type ExistingServiceCameraConfig = ExistingServiceAudioRecordingConfig & {
  camera?:
    | true
    | {
        button?: GenericButton;
        modalContainerStyle?: CustomStyle;
      };
};
