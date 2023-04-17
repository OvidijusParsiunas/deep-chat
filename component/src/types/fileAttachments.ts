import {CustomStyle} from './styles';

export interface FileAttachments {
  images?: boolean | {allowedFormats?: string};
  maxNumberOfFiles?: number;
  attachmentContainerStyle?: CustomStyle;
}
