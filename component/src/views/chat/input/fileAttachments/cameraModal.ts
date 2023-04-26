import {FileAttachmentsType} from './fileAttachmentsType';
import {FileAttachments} from './fileAttachments';
import {Modal} from './modal';

export class CameraModal extends Modal {
  private _dataURL?: string;
  private _stopped = false;
  private readonly _video: HTMLVideoElement;
  private readonly _captureButton: HTMLElement;
  private readonly _canvas: HTMLCanvasElement;

  constructor(viewContainerElement: HTMLElement, fileAttachmentsType: FileAttachmentsType) {
    super(viewContainerElement, ['modal-content', 'modal-camera-content'], {});
    this._canvas = document.createElement('canvas');
    this._canvas.classList.add('camera-modal-canvas');
    this._video = document.createElement('video');
    this._captureButton = this.addButtonsAndTheirEvents(fileAttachmentsType).captureButton;
    this._contentRef.appendChild(this._canvas);
  }

  private addButtonsAndTheirEvents(fileAttachmentsType: FileAttachmentsType) {
    const captureButton = Modal.createButton('Capture');
    const closeButton = this.addCloseButton('Cancel');
    const submitButton = Modal.createButton('Submit');
    this.addButtons(captureButton, submitButton);
    this.addButtonEvents(captureButton, closeButton, submitButton, fileAttachmentsType);
    return {captureButton};
  }

  // prettier-ignore
  private addButtonEvents(captureButton: HTMLElement, closeButton: HTMLElement, submitButton: HTMLElement,
      fileAttachmentsType: FileAttachmentsType) {
    captureButton.onclick = () => {
      this.capture();
    };
    closeButton.addEventListener('click', this.stop.bind(this));
    submitButton.onclick = () => {
      const file = this.getFile();
      if (file) FileAttachments.addFiles([file], [fileAttachmentsType]);
      this.stop();
      this.close();
    };
  }

  private stop() {
    this._stopped = true;
    setTimeout(() => {
      this._captureButton.textContent = 'Capture';
    }, Modal.MODAL_CLOSE_TIMEOUT_MS);
  }

  start() {
    this._dataURL = undefined;
    this._stopped = false;
    navigator.mediaDevices
      .getUserMedia({video: true})
      .then((stream) => {
        this._video.srcObject = stream;
        this._video.play();
        requestAnimationFrame(this.updateCanvas.bind(this, this._video, this._canvas));
      })
      .catch((err) => console.error(err));
  }

  private capture() {
    if (this._dataURL) {
      this._captureButton.textContent = 'Capture';
      this._dataURL = undefined;
    } else {
      this._captureButton.textContent = 'Reset';
      this._dataURL = this._canvas.toDataURL();
    }
  }

  private getFile() {
    if (this._dataURL) {
      const binaryData = atob(this._dataURL.split(',')[1]);
      const byteNumbers = new Array(binaryData.length);
      for (let i = 0; i < binaryData.length; i++) {
        byteNumbers[i] = binaryData.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], {type: 'image/png'});
      const filename = CameraModal.getFileName();
      return new File([blob], filename, {type: blob.type});
    }
    return undefined;
  }

  private static getFileName() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `photo-${hours}-${minutes}-${seconds}.png`;
  }

  private updateCanvas(video: HTMLVideoElement, canvas: HTMLCanvasElement) {
    if (this._stopped) return;
    if (!this._dataURL) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
    }
    requestAnimationFrame(this.updateCanvas.bind(this, video, canvas));
  }

  private openCameraModal(cameraModal: CameraModal) {
    this.displayModalElements();
    cameraModal.start();
  }

  public static createCameraModalFunc(viewContainerElement: HTMLElement, fileAttachmentsType: FileAttachmentsType) {
    const cameraModal = new CameraModal(viewContainerElement, fileAttachmentsType);
    return cameraModal.openCameraModal.bind(cameraModal, cameraModal);
  }
}
