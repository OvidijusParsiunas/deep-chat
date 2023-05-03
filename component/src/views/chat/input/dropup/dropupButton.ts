import {CustomButtonInnerElements} from '../buttons/customButtonInnerElements';
import {GenericInputButtonStyles} from '../../../../types/genericInputButton';
import {DefinedButtonStateStyles} from '../../../../types/buttonInternal';
import {CAMERA_ICON_STRING} from '../../../../icons/cameraIcon';
import {SVGIconUtils} from '../../../../utils/svg/svgIconUtils';
import {ButtonStyling} from '../buttons/buttonStyling';
import {DropupMenu} from './dropupMenu';

type Styles = DefinedButtonStateStyles<GenericInputButtonStyles>;

export class DropupButton extends ButtonStyling<Styles> {
  private readonly _menu: DropupMenu;

  constructor(styles?: GenericInputButtonStyles) {
    const defaultPosition = 'outside-left';
    super(DropupButton.createButtonElement(), defaultPosition, styles || {});
    const innerElements = DropupButton.createInnerElements(this._customStyles);
    this.reapplyStateStyle('styles');
    this._menu = new DropupMenu();
    this.addClickEvent();
    this.elementRef.appendChild(innerElements.styles);
    this.elementRef.appendChild(this._menu.elementRef);
  }

  private static createButtonElement() {
    const buttonElement = document.createElement('div');
    buttonElement.classList.add('input-button');
    return buttonElement;
  }

  private static createInnerElements(customStyles?: Styles) {
    return {
      styles: DropupButton.createInnerElement(DropupButton.createSVGIconElement(), 'styles', customStyles),
    };
  }

  private static createInnerElement(baseButton: SVGGraphicsElement, state: 'styles', customStyles?: Styles) {
    return CustomButtonInnerElements.createSpecificStateElement(state, '', customStyles) || baseButton;
  }

  private static createSVGIconElement() {
    const svgIconElement = SVGIconUtils.createSVGElement(CAMERA_ICON_STRING);
    svgIconElement.id = 'camera-icon';
    return svgIconElement;
  }

  private addClickEvent() {
    this.elementRef.onclick = this._menu.open;
  }

  addItem(svgIcon: SVGGraphicsElement | HTMLDivElement, text?: string) {
    this._menu.addItem(svgIcon, text);
  }
}
