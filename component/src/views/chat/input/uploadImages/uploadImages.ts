import {FileAttachments as FileAttachmentsT} from '../../../../types/fileAttachments';
import {UploadImagesButton} from '../buttons/uploadImages/uploadImagesButton';
import {RemarkableConfig} from '../../messages/remarkable/remarkableConfig';
import {FileAttachments} from '../fileAttachments/fileAttachments';
import {ServiceIO} from '../../../../services/serviceIO';
import {UploadImagesModal} from './uploadImagesModal';

export class UploadImages {
  button: UploadImagesButton;
  fileAttachments: FileAttachments;

  // prettier-ignore
  constructor(inputElementRef: HTMLElement, containerElement: HTMLElement, allowImages?: ServiceIO['allowImages'],
      fileAttachments?: FileAttachmentsT) {
    const maxNumberOfImages = UploadImages.getMaxNumberOfImages(fileAttachments, allowImages);
    this.fileAttachments = new FileAttachments(inputElementRef, fileAttachments, maxNumberOfImages);
    const acceptedFormats = UploadImages.getAcceptedFormats(fileAttachments, allowImages);
    const openModalFunc = UploadImages.getOpenModalFunc(containerElement, fileAttachments, allowImages);
    const openModalOnce = UploadImages.getOpenModalOnce(fileAttachments, allowImages);
    this.button = new UploadImagesButton(this.fileAttachments, acceptedFormats, openModalFunc, openModalOnce);
  }

  private static getMaxNumberOfImages(fileAttachments?: FileAttachmentsT, allowImages?: ServiceIO['allowImages']) {
    if (typeof fileAttachments?.images === 'object') {
      return fileAttachments?.maxNumberOfFiles;
    }
    if (typeof allowImages === 'object') {
      return allowImages.maxNumberOfFiles;
    }
    return undefined;
  }

  private static getAcceptedFormats(fileAttachments?: FileAttachmentsT, allowImages?: ServiceIO['allowImages']) {
    if (typeof fileAttachments?.images === 'object') {
      return fileAttachments?.images?.acceptedFormats;
    }
    if (typeof allowImages === 'object') {
      return allowImages.acceptedFormats;
    }
    return undefined;
  }

  // prettier-ignore
  private static getOpenModalFunc(containerElement: HTMLElement, fileAttachments?: FileAttachmentsT,
      allowImages?: ServiceIO['allowImages']) {
    if (typeof fileAttachments?.images === 'object' && fileAttachments.images.infoModal?.textMarkDown) {
      const remarkable = RemarkableConfig.createNew();
      const modalTextMarkUp = remarkable.render(fileAttachments.images.infoModal.textMarkDown);
      const uploadImagesModal = new UploadImagesModal(containerElement);
      return uploadImagesModal.open.bind(uploadImagesModal, modalTextMarkUp);
    }
    if (typeof allowImages === 'object' && allowImages.modalTextMarkUp) {
      const uploadImagesModal = new UploadImagesModal(containerElement);
      return uploadImagesModal.open.bind(uploadImagesModal, allowImages.modalTextMarkUp);
    }
    return undefined;
  }

  private static getOpenModalOnce(fileAttachments?: FileAttachmentsT, allowImages?: ServiceIO['allowImages']) {
    if (typeof fileAttachments?.images === 'object') {
      return fileAttachments?.images?.infoModal?.openModalOnce;
    }
    if (typeof allowImages === 'object') {
      return allowImages.openModalOnce;
    }
    return undefined;
  }

  public static isAvailable(fileAttachments?: FileAttachmentsT, allowImages?: ServiceIO['allowImages']) {
    if (fileAttachments !== undefined) {
      return !!fileAttachments.images;
    }
    return !!allowImages;
  }
}
