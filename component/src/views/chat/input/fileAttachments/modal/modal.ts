import {CLASS_LIST, CREATE_ELEMENT, STYLE} from '../../../../../utils/consts/htmlConstants';
import {KEYBOARD_KEY} from '../../../../../utils/buttons/keyboardKeys';
import {ButtonAccessibility} from '../../buttons/buttonAccessility';
import {SVGIconUtils} from '../../../../../utils/svg/svgIconUtils';
import {FILES} from '../../../../../utils/consts/messageConstants';
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
    const containerElement = CREATE_ELEMENT();
    containerElement[CLASS_LIST].add('modal');
    containerElement.appendChild(content);
    if (containerStyle) delete containerStyle.backgroundColor;
    Object.assign(containerElement[STYLE], containerStyle);
    return containerElement;
  }

  private static createModalContent(contentClasses: string[], backgroundColor?: string) {
    const contentElement = CREATE_ELEMENT();
    contentElement[CLASS_LIST].add(...contentClasses);
    if (backgroundColor) contentElement[STYLE].backgroundColor = backgroundColor;
    const contentContainerElement = CREATE_ELEMENT();
    contentContainerElement.appendChild(contentElement);
    return contentElement;
  }

  private static createButtonPanel(backgroundColor?: string) {
    const buttonPanelElement = CREATE_ELEMENT();
    buttonPanelElement[CLASS_LIST].add('modal-button-panel');
    if (backgroundColor) buttonPanelElement[STYLE].backgroundColor = backgroundColor;
    return buttonPanelElement;
  }

  private static createDarkBackgroundPanel() {
    const backgroundPanel = CREATE_ELEMENT();
    backgroundPanel.id = 'modal-background-panel';
    return backgroundPanel;
  }

  public addButtons(...buttons: HTMLElement[]) {
    buttons.forEach((button) => {
      ButtonAccessibility.addAttributes(button);
      this._buttonPanel.appendChild(button);
    });
  }

  private static createTextButton(text: string) {
    const button = CREATE_ELEMENT();
    button[CLASS_LIST].add('modal-button');
    button.textContent = text;
    return button;
  }

  public static createSVGButton(svgString: string) {
    const button = CREATE_ELEMENT();
    button[CLASS_LIST].add('modal-button', 'modal-svg-button');
    const icon = SVGIconUtils.createSVGElement(svgString);
    icon[CLASS_LIST].add('modal-svg-button-icon');
    button.appendChild(icon);
    return button;
  }

  close() {
    this._elementRef[CLASS_LIST].remove('show-modal');
    this._elementRef[CLASS_LIST].add('hide-modal');
    this._backgroundPanelRef[CLASS_LIST].remove('show-modal-background');
    this._backgroundPanelRef[CLASS_LIST].add('hide-modal-background');
    this._isOpen = false;
    setTimeout(() => {
      this._elementRef[STYLE].display = 'none';
      this._backgroundPanelRef[STYLE].display = 'none';
    }, Modal.MODAL_CLOSE_TIMEOUT_MS);
  }

  displayModalElements() {
    this._elementRef[STYLE].display = 'flex';
    this._elementRef[CLASS_LIST].remove('hide-modal');
    this._elementRef[CLASS_LIST].add('show-modal');
    this._backgroundPanelRef[STYLE].display = 'block';
    this._backgroundPanelRef[CLASS_LIST].remove('hide-modal-background');
    this._backgroundPanelRef[CLASS_LIST].add('show-modal-background');
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
    if (typeof fileIO === 'object' && fileIO[FILES]?.infoModal) {
      const modal = new Modal(viewContainerElement, ['modal-content'], fileIO[FILES].infoModal.containerStyle);
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
