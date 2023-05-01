import {PhotoFormat, CameraDimensions} from './camera';

export interface CameraFiles {
  maxNumberOfFiles?: number;
  acceptedFormats?: string; // for drag and drop -> overwritten by image button if available
  newFilePrefix?: string;
  format?: PhotoFormat;
  dimensions?: CameraDimensions;
}
