import {ServiceFileTypes, ServiceIO} from '../../../../../services/serviceIO';
import {FileAttachments} from '../../../../../types/fileAttachments';
import {AudioFileAttachmentType} from './audioFileAttachmentType';
import {FileAttachmentsType} from './fileAttachmentsType';
import {DeepChat} from '../../../../../deepChat';

export class FileAttachmentTypeFactory {
  // prettier-ignore
  public static create(deepChat: DeepChat, serviceIO: ServiceIO, files: FileAttachments,
      toggleContainer: (display: boolean) => void, container: HTMLElement, type: keyof ServiceFileTypes) {
    if (type === 'audio') {
      return new AudioFileAttachmentType(deepChat, serviceIO, files, toggleContainer, container);
    }
    return new FileAttachmentsType(deepChat, serviceIO, files, toggleContainer, container);
  }
}
