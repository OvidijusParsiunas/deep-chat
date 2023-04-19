import {UploadImagesButton} from '../buttons/uploadImages/uploadImagesButton';
import {FileAttachments} from '../fileAttachments/fileAttachments';
import {ImagesConfig} from '../../../../services/serviceIO';
import {UploadImagesModal} from './uploadImagesModal';
import {CustomStyle} from '../../../../types/styles';

export class UploadImages {
  button: UploadImagesButton;
  fileAttachments: FileAttachments;

  // prettier-ignore
  constructor(inputElementRef: HTMLElement, containerElement: HTMLElement, images: ImagesConfig,
      attachmentContainerStyle?: CustomStyle) {
    this.fileAttachments = new FileAttachments(inputElementRef, images, attachmentContainerStyle);
    const openModalFunc = UploadImages.getOpenModalFunc(containerElement, images);
    this.button = new UploadImagesButton(this.fileAttachments, images, openModalFunc);
  }

  private static getOpenModalFunc(viewContainerElement: HTMLElement, images: ImagesConfig) {
    if (typeof images === 'object' && images.infoModal) {
      const uploadImagesModal = new UploadImagesModal(viewContainerElement, images.infoModal.containerStyle);
      return uploadImagesModal.open.bind(uploadImagesModal, images.infoModal.textMarkDown || '');
    }
    return undefined;
  }
}
