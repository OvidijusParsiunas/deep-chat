import {UploadImagesButton} from '../buttons/uploadImages/uploadImagesButton';
import {FileAttachments} from '../fileAttachments/fileAttachments';
import {ImagesConfig} from '../../../../services/serviceIO';
import {UploadImagesModal} from './uploadImagesModal';
import {CustomStyle} from '../../../../types/styles';
import {FileDrop} from '../fileAttachments/fileDrop';

export class UploadImages {
  button: UploadImagesButton;
  fileAttachments: FileAttachments;

  // prettier-ignore
  constructor(inputElementRef: HTMLElement, containerElement: HTMLElement, images: ImagesConfig,
      attachmentContainerStyle?: CustomStyle) {
    this.fileAttachments = new FileAttachments(inputElementRef, images, attachmentContainerStyle);
    const openModalFunc = UploadImages.getOpenModalFunc(containerElement, images);
    this.button = new UploadImagesButton(this.fileAttachments, images, openModalFunc);
    if (images.files?.dragAndDrop) FileDrop.append(containerElement, this.fileAttachments, images.files.dragAndDrop);
  }

  private static getOpenModalFunc(viewContainerElement: HTMLElement, images: ImagesConfig) {
    if (typeof images === 'object' && images.files?.infoModal) {
      const uploadImagesModal = new UploadImagesModal(viewContainerElement, images.files.infoModal.containerStyle);
      return uploadImagesModal.open.bind(uploadImagesModal, images.infoModalTextMarkUp || '');
    }
    return undefined;
  }
}
