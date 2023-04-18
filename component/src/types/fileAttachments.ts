import {CustomStyle} from './styles';

export interface UploadImagesConfig {
  acceptedFormats?: string;
  infoModal: {textMarkDown: string; openModalOnce?: boolean};
}

export interface FileAttachments {
  images?: UploadImagesConfig;
  maxNumberOfFiles?: number;
  attachmentContainerStyle?: CustomStyle;
}
