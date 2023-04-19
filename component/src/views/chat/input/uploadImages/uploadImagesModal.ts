import {CustomStyle} from '../../../../types/styles';

export class UploadImagesModal {
  private readonly _elementRef: HTMLElement;
  private readonly _backgroundPanelRef: HTMLElement;
  private readonly _textRef: HTMLElement;
  private readonly _buttonRef: HTMLElement;

  constructor(viewContainerElement: HTMLElement, containerStyle?: CustomStyle) {
    this._buttonRef = UploadImagesModal.createButton();
    this._textRef = UploadImagesModal.createModalText();
    this._elementRef = this.createContainer(this._buttonRef, containerStyle);
    viewContainerElement.appendChild(this._elementRef);
    this._backgroundPanelRef = UploadImagesModal.createDarkBackgroundPanel();
    viewContainerElement.appendChild(this._backgroundPanelRef);
  }

  public createContainer(button: HTMLElement, containerStyle?: CustomStyle) {
    const containerElement = document.createElement('div');
    containerElement.classList.add('modal');
    containerElement.appendChild(this._textRef);
    containerElement.appendChild(UploadImagesModal.createButtonPanel(button));
    Object.assign(containerElement.style, containerStyle);
    return containerElement;
  }

  private static createModalText() {
    const textElement = document.createElement('div');
    textElement.classList.add('modal-text');
    const textContainerElement = document.createElement('div');
    textContainerElement.appendChild(textElement);
    return textElement;
  }

  private static createButtonPanel(button: HTMLElement) {
    const buttonPanelElement = document.createElement('div');
    buttonPanelElement.classList.add('modal-button-panel');
    buttonPanelElement.appendChild(button);
    return buttonPanelElement;
  }

  private static createButton() {
    const button = document.createElement('div');
    button.classList.add('modal-button');
    button.textContent = 'OK';
    return button;
  }

  private close() {
    this._elementRef.classList.remove('show-modal');
    this._elementRef.classList.add('hide-modal');
    this._backgroundPanelRef.classList.remove('show-modal-background');
    this._backgroundPanelRef.classList.add('hide-modal-background');
    setTimeout(() => {
      this._elementRef.style.display = 'none';
      this._backgroundPanelRef.style.display = 'none';
    }, 200);
  }

  open(textHTML: string, callback: () => void) {
    this._textRef.innerHTML = textHTML;
    this._elementRef.style.display = 'flex';
    this._elementRef.classList.remove('hide-modal');
    this._elementRef.classList.add('show-modal');
    this._backgroundPanelRef.style.display = 'block';
    this._backgroundPanelRef.classList.remove('hide-modal-background');
    this._backgroundPanelRef.classList.add('show-modal-background');
    this.addButtonCallback(callback);
  }

  public static createDarkBackgroundPanel() {
    const backgroundPanel = document.createElement('div');
    backgroundPanel.id = 'modal-background-panel';
    return backgroundPanel;
  }

  private addButtonCallback(callback: () => void) {
    this._buttonRef.onclick = () => {
      this.close();
      setTimeout(() => {
        callback();
      }, 150); // the process to open the file window can interrupt the animation - hence closing before executing
    };
  }
}
