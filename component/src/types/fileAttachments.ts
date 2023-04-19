import {CustomStyle} from './styles';

export interface InfoModal {
  textMarkDown?: string;
  openModalOnce?: boolean;
  containerStyle?: CustomStyle;
}

export interface FileAttachments {
  acceptedFormats?: string;
  maxNumberOfFiles?: number;
  infoModal?: InfoModal;
}
