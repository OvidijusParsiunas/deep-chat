import {UploadImagesButton} from './buttons/uploadImages/uploadImagesButton';
import {UploadImages as UploadImagesT} from '../../../types/uploadImages';
import {ImageAttachments} from './buttons/uploadImages/imageAttachments';
import {ServiceIO} from '../../../services/serviceIO';

export class UploadImages {
  button: UploadImagesButton;
  imageAttachments: ImageAttachments;

  constructor(inputElementRef: HTMLElement) {
    this.imageAttachments = new ImageAttachments(inputElementRef);
    this.button = new UploadImagesButton(this.imageAttachments);
  }

  public static isAvailable(serviceIO: ServiceIO, uploadImages?: UploadImagesT) {
    if (uploadImages !== undefined) {
      return !!uploadImages;
    }
    return !!serviceIO.allowImages;
  }
}
