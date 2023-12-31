import {KEYBOARD_KEY} from '../../../../../utils/buttons/keyboardKeys';
import {SVGIconUtils} from '../../../../../utils/svg/svgIconUtils';
import {FileServiceIO} from '../../../../../services/serviceIO';
import {CustomStyle} from '../../../../../types/styles';

export class Modal {
  public static readonly MODAL_CLOSE_TIMEOUT_MS = 190;
  readonly _contentRef: HTMLElement;
  private readonly _elementRef: HTMLElement;
  private readonly _backgroundPanelRef: HTMLElement;
  private readonly _buttonPanel: HTMLElement;
  private _isOpen = false;
  extensionCloseCallback?: () => void;
  private keyDownEvent?: (event: KeyboardEvent) => void;

  constructor(viewContainerElement: HTMLElement, contentClasses: string[], containerStyle?: CustomStyle) {
    this._contentRef = Modal.createModalContent(contentClasses, containerStyle?.backgroundColor);
    this._buttonPanel = Modal.createButtonPanel(containerStyle?.backgroundColor);
    this._elementRef = Modal.createContainer(this._contentRef, containerStyle);
    this._elementRef.appendChild(this._buttonPanel);
    viewContainerElement.appendChild(this._elementRef);
    this._backgroundPanelRef = Modal.createDarkBackgroundPanel();
    viewContainerElement.appendChild(this._backgroundPanelRef);
    this.addWindowEvents(viewContainerElement);
  }

  isOpen() {
    return this._isOpen;
  }

  private static createContainer(content: HTMLElement, containerStyle?: CustomStyle) {
    const containerElement = document.createElement('div');
    containerElement.classList.add('modal');
    containerElement.appendChild(content);
    if (containerStyle) delete containerStyle.backgroundColor;
    Object.assign(containerElement.style, containerStyle);
    return containerElement;
  }

  private static createModalContent(contentClasses: string[], backgroundColor?: string) {
    const contentElement = document.createElement('div');
    contentElement.classList.add(...contentClasses);
    if (backgroundColor) contentElement.style.backgroundColor = backgroundColor;
    const contentContainerElement = document.createElement('div');
    contentContainerElement.appendChild(contentElement);
    return contentElement;
  }

  private static createButtonPanel(backgroundColor?: string) {
    const buttonPanelElement = document.createElement('div');
    buttonPanelElement.classList.add('modal-button-panel');
    if (backgroundColor) buttonPanelElement.style.backgroundColor = backgroundColor;
    return buttonPanelElement;
  }

  private static createDarkBackgroundPanel() {
    const backgroundPanel = document.createElement('div');
    backgroundPanel.id = 'modal-background-panel';
    return backgroundPanel;
  }

  addButtons(...buttons: HTMLElement[]) {
    buttons.forEach((button) => this._buttonPanel.appendChild(button));
  }

  private static createTextButton(text: string) {
    const button = document.createElement('div');
    button.classList.add('modal-button');
    button.textContent = text;
    return button;
  }

  public static createSVGButton(svgString: string) {
    const button = document.createElement('div');
    button.classList.add('modal-button', 'modal-svg-button');
    const icon = SVGIconUtils.createSVGElement(svgString);
    icon.classList.add('modal-svg-button-icon');
    button.appendChild(icon);
    return button;
  }

  close() {
    this._elementRef.classList.remove('show-modal');
    this._elementRef.classList.add('hide-modal');
    this._backgroundPanelRef.classList.remove('show-modal-background');
    this._backgroundPanelRef.classList.add('hide-modal-background');
    this._isOpen = false;
    setTimeout(() => {
      this._elementRef.style.display = 'none';
      this._backgroundPanelRef.style.display = 'none';
    }, Modal.MODAL_CLOSE_TIMEOUT_MS);
  }

  displayModalElements() {
    this._elementRef.style.display = 'flex';
    this._elementRef.classList.remove('hide-modal');
    this._elementRef.classList.add('show-modal');
    this._backgroundPanelRef.style.display = 'block';
    this._backgroundPanelRef.classList.remove('hide-modal-background');
    this._backgroundPanelRef.classList.add('show-modal-background');
    this._isOpen = true;
  }

  private openTextModal(textHTML: string) {
    this._contentRef.innerHTML = textHTML;
    this.displayModalElements();
  }

  addCloseButton(text: string, isSVG: boolean, callback?: () => void) {
    const closeButton = isSVG ? Modal.createSVGButton(text) : Modal.createTextButton(text);
    this.addButtons(closeButton);
    closeButton.onclick = () => {
      this.close();
      setTimeout(() => {
        callback?.();
      }, 140); // the process to open the file window can interrupt the animation - hence closing before executing
    };
    return closeButton;
  }

  public static createTextModalFunc(viewContainerElement: HTMLElement, fileIO: FileServiceIO, closeCallback: () => void) {
    if (typeof fileIO === 'object' && fileIO.files?.infoModal) {
      const modal = new Modal(viewContainerElement, ['modal-content'], fileIO.files.infoModal.containerStyle);
      modal.addCloseButton('OK', false, closeCallback);
      return modal.openTextModal.bind(modal, fileIO.infoModalTextMarkUp || '');
    }
    return undefined;
  }

  private addWindowEvents(viewContainerElement: HTMLElement) {
    this.keyDownEvent = this.windowKeyDown.bind(this, viewContainerElement);
    window.addEventListener('keydown', this.keyDownEvent);
  }

  private windowKeyDown(viewContainerElement: HTMLElement, event: KeyboardEvent) {
    if (!viewContainerElement.isConnected && this.keyDownEvent) {
      window.removeEventListener('keydown', this.keyDownEvent);
    } else if (this._isOpen) {
      if (event.key === KEYBOARD_KEY.ESCAPE) {
        this.close();
        this.extensionCloseCallback?.();
      } else if (event.key === KEYBOARD_KEY.ENTER) {
        this.close();
        this.extensionCloseCallback?.();
      }
    }
  }
}
