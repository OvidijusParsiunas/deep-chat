import {CustomButtonInnerElements} from '../buttons/customButtonInnerElements';
import {GenericInputButtonStyles} from '../../../../types/genericInputButton';
import {DefinedButtonStateStyles} from '../../../../types/buttonInternal';
import {CAMERA_ICON_STRING} from '../../../../icons/cameraIcon';
import {SVGIconUtils} from '../../../../utils/svg/svgIconUtils';
import {InputButton} from '../buttons/inputButton';
import {DropupMenu} from './dropupMenu';

type Styles = DefinedButtonStateStyles<GenericInputButtonStyles>;

export class Dropup extends InputButton<Styles> {
  private readonly _menu: DropupMenu;
  readonly buttonContainer: HTMLElement;

  constructor(containerElement: HTMLElement, styles?: GenericInputButtonStyles) {
    super(Dropup.createButtonElement(), undefined, styles || {});
    const innerElements = Dropup.createInnerElements(this._customStyles);
    this.reapplyStateStyle('styles');
    this._menu = new DropupMenu(containerElement);
    this.addClickEvent();
    this.buttonContainer = document.createElement('div');
    this.elementRef.appendChild(innerElements.styles);
    this.buttonContainer.appendChild(this.elementRef);
    this.elementRef.classList.add('dropup-icon');
    this.buttonContainer.appendChild(this._menu.elementRef);
    this.addContainerEvents(containerElement);
  }

  private static createButtonElement() {
    const buttonElement = document.createElement('div');
    buttonElement.classList.add('input-button');
    return buttonElement;
  }

  private static createInnerElements(customStyles?: Styles) {
    return {
      styles: Dropup.createInnerElement(Dropup.createSVGIconElement(), 'styles', customStyles),
    };
  }

  private static createInnerElement(baseButton: SVGGraphicsElement, state: 'styles', customStyles?: Styles) {
    return CustomButtonInnerElements.createSpecificStateElement(state, '', customStyles) || baseButton;
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
