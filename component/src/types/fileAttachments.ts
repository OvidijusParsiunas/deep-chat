import {CustomStyle} from './styles';

export interface DragAndDrop {
  acceptedTypePrefixes?: string[];
  acceptedFileNamePostfixes?: string[];
}

export interface InfoModal {
  textMarkDown?: string;
  openModalOnce?: boolean;
  containerStyle?: CustomStyle;
}

export interface FileAttachments {
  acceptedFormats?: string;
  maxNumberOfFiles?: number;
  infoModal?: InfoModal;
  dragAndDrop?: boolean | DragAndDrop;
}
