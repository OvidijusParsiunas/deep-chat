import {CustomButtonInnerElements} from '../buttons/customButtonInnerElements';
import {GenericInputButtonStyles} from '../../../../types/genericInputButton';
import {DefinedButtonStateStyles} from '../../../../types/buttonInternal';
import {CAMERA_ICON_STRING} from '../../../../icons/cameraIcon';
import {SVGIconUtils} from '../../../../utils/svg/svgIconUtils';
import {DropupStyles} from '../../../../types/dropupStyles';
import {InputButton} from '../buttons/inputButton';
import {DropupMenu} from './dropupMenu';

type Styles = DefinedButtonStateStyles<GenericInputButtonStyles>;

export class Dropup extends InputButton<Styles> {
  private readonly _menu: DropupMenu;
  readonly buttonContainer: HTMLElement;

  constructor(containerElement: HTMLElement, styles?: DropupStyles) {
    super(Dropup.createButtonElement(), undefined, {styles: styles?.button} || {});
    const innerElements = this.createInnerElements(this._customStyles);
    this._menu = new DropupMenu(containerElement, styles?.menu);
    this.addClickEvent();
    this.buttonContainer = document.createElement('div');
    this.elementRef.appendChild(innerElements.styles);
    this.buttonContainer.appendChild(this.elementRef);
    this.elementRef.classList.add('dropup-icon');
    this.buttonContainer.appendChild(this._menu.elementRef);
    this.reapplyStateStyle('styles');
    this.addContainerEvents(containerElement);
  }

  private static createButtonElement() {
    const buttonElement = document.createElement('div');
    buttonElement.classList.add('input-button');
    return buttonElement;
  }

  private createInnerElements(customStyles?: Styles) {
    return {
      styles: this.createInnerElement(Dropup.createSVGIconElement(), 'styles', customStyles),
    };
  }

  private createInnerElement(baseButton: SVGGraphicsElement, state: 'styles', customStyles?: Styles) {
    return CustomButtonInnerElements.createSpecificStateElement(this.elementRef, state, '', customStyles) || baseButton;
  }

  private static createSVGIconElement() {
    const svgIconElement = SVGIconUtils.createSVGElement(CAMERA_ICON_STRING);
    svgIconElement.id = 'dropup-icon';
    return svgIconElement;
  }

  private addClickEvent() {
    this.elementRef.onclick = this._menu.toggle.bind(this._menu);
  }

  addItem(buttonProps: InputButton) {
    this._menu.addItem(buttonProps);
  }

  private addContainerEvents(containerElement: HTMLElement) {
    containerElement.addEventListener('click', (event) => {
      if (!(event.target as HTMLElement).classList.contains('dropup-icon')) this._menu.close();
    });
  }
}
