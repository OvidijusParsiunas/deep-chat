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
