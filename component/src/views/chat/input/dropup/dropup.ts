import {PositionToButtons} from '../buttons/styleAdjustments/inputButtonPositions';
import {GenericInputButtonStyles} from '../../../../types/genericInputButton';
import {DefinedButtonStateStyles} from '../../../../types/buttonInternal';
import {ButtonInnerElements} from '../buttons/buttonInnerElements';
import {SVGIconUtils} from '../../../../utils/svg/svgIconUtils';
import {DropupStyles} from '../../../../types/dropupStyles';
import {PLUS_ICON_STRING} from '../../../../icons/plusIcon';
import {InputButton} from '../buttons/inputButton';
import {DropupMenu} from './dropupMenu';
import {DropupItem} from './dropupItem';

type Styles = DefinedButtonStateStyles<GenericInputButtonStyles>;

export class Dropup extends InputButton<Styles> {
  private readonly _menu: DropupMenu;
  public static BUTTON_ICON_CLASS = 'dropup-icon';
  readonly buttonContainer: HTMLElement;

  constructor(containerElement: HTMLElement, styles?: DropupStyles) {
    super(Dropup.createButtonElement(), undefined, {styles: styles?.button?.styles});
    const innerElements = this.createInnerElements(this._customStyles);
    this._menu = new DropupMenu(containerElement, styles?.menu);
    this.addClickEvent();
    this.buttonContainer = Dropup.createButtonContainer();
    this.elementRef.appendChild(innerElements.styles);
    this.buttonContainer.appendChild(this.elementRef);
    this.elementRef.classList.add(Dropup.BUTTON_ICON_CLASS, 'upload-file-button');
    this.elementRef.children[0].id = 'dropup-icon';
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
    return ButtonInnerElements.createSpecificStateElement(this.elementRef, state, customStyles) || baseButton;
  }

  private static createSVGIconElement() {
    const svgIconElement = SVGIconUtils.createSVGElement(PLUS_ICON_STRING);
    return svgIconElement;
  }

  private addClickEvent() {
    this.elementRef.onclick = this._menu.toggle.bind(this._menu);
  }

  private static createButtonContainer() {
    const buttonContainer = document.createElement('div');
    buttonContainer.id = 'dropup-container';
    return buttonContainer;
  }

  addItem(buttonProps: InputButton) {
    this._menu.addItem(buttonProps);
  }

  private addContainerEvents(containerElement: HTMLElement) {
    containerElement.addEventListener('click', (event) => {
      const classes = (event.target as HTMLElement).classList;
      if (!classes.contains(Dropup.BUTTON_ICON_CLASS) && !classes.contains(DropupItem.DISABLED_ITEM_CLASS)) {
        this._menu.close();
      }
    });
  }

  static getPosition(pToBs: PositionToButtons, dropupStyles?: DropupStyles) {
    if (dropupStyles?.button?.position) {
      return dropupStyles?.button?.position;
    }
    if (pToBs['outside-left'].length > 0 && pToBs['outside-right'].length === 0) {
      return 'outside-right';
    }
    return 'outside-left';
  }
}
