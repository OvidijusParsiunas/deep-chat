import {ExistingServiceAudioRecordingConfig} from './microphone';
import {CustomStyle} from './styles';
import {Button} from './button';

export interface CameraDimensions {
  width?: number;
  height?: number;
}

export type PhotoFormat = 'png' | 'jpeg';

export type ExistingServiceCameraConfig = ExistingServiceAudioRecordingConfig & {
  camera?:
    | true
    | {
        button?: Button;
        modalContainerStyle?: CustomStyle;
      };
};
