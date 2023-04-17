import {FileAttachments as FileAttachmentsT} from '../../../types/fileAttachments';
import {UploadImagesButton} from './buttons/uploadImages/uploadImagesButton';
import {FileAttachments} from './fileAttachments/fileAttachments';
import {ServiceIO} from '../../../services/serviceIO';

export class UploadImages {
  button: UploadImagesButton;
  fileAttachments: FileAttachments;

  constructor(inputElementRef: HTMLElement, allowImages?: FileAttachmentsT['images'], fileAttachments?: FileAttachmentsT) {
    this.fileAttachments = new FileAttachments(inputElementRef, fileAttachments);
    const allowedFormats = UploadImages.getAllowedFormats(allowImages, fileAttachments);
    this.button = new UploadImagesButton(this.fileAttachments, allowedFormats);
  }

  private static getAllowedFormats(allowImages?: FileAttachmentsT['images'], fileAttachments?: FileAttachmentsT) {
    if (typeof fileAttachments?.images === 'object') {
      return fileAttachments?.images?.allowedFormats;
    }
    if (typeof allowImages === 'object') {
      return allowImages.allowedFormats;
    }
    return undefined;
  }

  public static isAvailable(serviceIO: ServiceIO, fileAttachments?: FileAttachmentsT) {
    if (fileAttachments !== undefined) {
      return !!fileAttachments.images;
    }
    return !!serviceIO.allowImages;
  }
}
