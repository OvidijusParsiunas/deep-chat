import {CustomStyle} from './styles';

export interface InfoModal {
  textMarkDown: string;
  openModalOnce?: boolean;
  containerStyle?: CustomStyle;
}

export interface FileAttachments {
  maxNumberOfFiles?: number;
  acceptedFormats?: string;
  infoModal?: InfoModal;
}
