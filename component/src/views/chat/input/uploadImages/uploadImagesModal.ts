import {RemarkableConfig} from '../../messages/remarkable/remarkableConfig';

export class UploadImagesModal {
  private readonly _elementRef: HTMLElement;
  private readonly _backgroundPanelRef: HTMLElement;
  private readonly _button: HTMLElement;

  constructor(viewContainerElement: HTMLElement) {
    this._button = UploadImagesModal.createButton();
    this._elementRef = this.createContainer(this._button);
    viewContainerElement.appendChild(this._elementRef);
    this._backgroundPanelRef = UploadImagesModal.createDarkBackgroundPanel();
    viewContainerElement.appendChild(this._backgroundPanelRef);
  }

  public createContainer(button: HTMLElement) {
    const containerElement = document.createElement('div');
    containerElement.classList.add('modal');
    containerElement.appendChild(UploadImagesModal.createModalText());
    containerElement.appendChild(UploadImagesModal.createButtonPanel(button));
    return containerElement;
  }

  private static createModalText() {
    const textElement = document.createElement('div');
    textElement.classList.add('modal-text');
    const remarkable = RemarkableConfig.createNew();
    textElement.innerHTML = remarkable.render(`
1 image:

- With text - edits image based on the text
- No text - creates a variation of the image

2 images:

- The second image needs to be a copy of the first with a transparent area where the edit should take place.
Add text to describe the required modification.

Click here for [more info](https://platform.openai.com/docs/guides/images/introduction).
`);
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

  open(callback: () => void) {
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
    this._button.onclick = () => {
      this.close();
      setTimeout(() => {
        callback();
      }, 150); // the process to open the file window can interrupt the animation - hence closing before executing
    };
  }
}
