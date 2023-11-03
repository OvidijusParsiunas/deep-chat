import {FileAttachments} from '../../../../../types/fileAttachments';
import {ServiceFileTypes} from '../../../../../services/serviceIO';
import {AudioFileAttachmentType} from './audioFileAttachmentType';
import {FileAttachmentsType} from './fileAttachmentsType';
import {DeepChat} from '../../../../../deepChat';

export class FileAttachmentTypeFactory {
  // prettier-ignore
  public static create(deepChat: DeepChat, files: FileAttachments, toggleContainer: (display: boolean) => void,
      container: HTMLElement, type: keyof ServiceFileTypes) {
    if (type === 'audio') {
      return new AudioFileAttachmentType(deepChat, files, toggleContainer, container);
    }
    return new FileAttachmentsType(deepChat, files, toggleContainer, container);
  }
}
