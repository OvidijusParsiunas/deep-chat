import {CustomStyle} from './styles';

export interface FileAttachments {
  images?: boolean | {acceptedFormats?: string};
  maxNumberOfFiles?: number;
  attachmentContainerStyle?: CustomStyle;
}
