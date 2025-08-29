import {PositionToButtons} from '../buttons/styleAdjustments/inputButtonPositions';
import {GenericInputButtonStyles} from '../../../../types/genericInputButton';
import {DefinedButtonStateStyles} from '../../../../types/buttonInternal';
import {TooltipUtils} from '../buttons/tooltip/tooltipUtils';
import {DropupStyles} from '../../../../types/dropupStyles';
import {PLUS_ICON_STRING} from '../../../../icons/plusIcon';
import {CustomButton} from '../buttons/custom/customButton';
import {InputButton} from '../buttons/inputButton';
import {DropupMenu} from './dropupMenu';

type Styles = DefinedButtonStateStyles<GenericInputButtonStyles>;

export class Dropup extends InputButton<Styles> {
  private readonly _menu: DropupMenu;
  public static BUTTON_ICON_CLASS = 'dropup-button';
  readonly buttonContainer: HTMLElement;

  constructor(containerElement: HTMLElement, styles?: DropupStyles) {
    const tooltip = TooltipUtils.tryCreateConfig('Options', styles?.button?.tooltip);
    super(Dropup.createButtonElement(), PLUS_ICON_STRING, undefined, tooltip, {styles: styles?.button?.styles});
    const innerElements = this.createInnerElementsForStates(this.customStyles);
    this._menu = new DropupMenu(containerElement, styles?.menu);
    this.addClickEvent();
    this.buttonContainer = Dropup.createButtonContainer();
    this.changeElementsByState(innerElements.styles);
    this.buttonContainer.appendChild(this.elementRef);
    this.elementRef.classList.add(Dropup.BUTTON_ICON_CLASS);
    this.buttonContainer.appendChild(this._menu.elementRef);
    this.reapplyStateStyle('styles');
    this.addContainerEvents(containerElement);
  }

  private static createButtonElement() {
    const buttonElement = document.createElement('div');
    buttonElement.classList.add('input-button');
    return buttonElement;
  }

  private createInnerElementsForStates(customStyles?: Styles) {
    return {
      styles: this.createInnerElements('dropup-icon', 'styles', customStyles),
    };
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
      if (!classes.contains(Dropup.BUTTON_ICON_CLASS) && !classes.contains(CustomButton.DISABLED_CONTAINER_CLASS)) {
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
