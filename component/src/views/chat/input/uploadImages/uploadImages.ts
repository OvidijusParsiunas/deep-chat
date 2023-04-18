import {FileAttachments as FileAttachmentsT} from '../../../../types/fileAttachments';
import {UploadImagesButton} from '../buttons/uploadImages/uploadImagesButton';
import {FileAttachments} from '../fileAttachments/fileAttachments';
import {ServiceIO} from '../../../../services/serviceIO';

export class UploadImages {
  button: UploadImagesButton;
  fileAttachments: FileAttachments;

  constructor(inputElementRef: HTMLElement, allowImages?: ServiceIO['allowImages'], fileAttachments?: FileAttachmentsT) {
    const maxNumberOfImages = UploadImages.getMaxNumberOfImages(allowImages, fileAttachments);
    this.fileAttachments = new FileAttachments(inputElementRef, fileAttachments, maxNumberOfImages);
    const acceptedFormats = UploadImages.getAcceptedFormats(allowImages, fileAttachments);
    this.button = new UploadImagesButton(this.fileAttachments, acceptedFormats);
  }

  private static getMaxNumberOfImages(allowImages?: ServiceIO['allowImages'], fileAttachments?: FileAttachmentsT) {
    if (typeof fileAttachments?.images === 'object') {
      return fileAttachments?.maxNumberOfFiles;
    }
    if (typeof allowImages === 'object') {
      return allowImages.maxNumberOfFiles;
    }
    return undefined;
  }

  private static getAcceptedFormats(allowImages?: ServiceIO['allowImages'], fileAttachments?: FileAttachmentsT) {
    if (typeof fileAttachments?.images === 'object') {
      return fileAttachments?.images?.acceptedFormats;
    }
    if (typeof allowImages === 'object') {
      return allowImages.acceptedFormats;
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
