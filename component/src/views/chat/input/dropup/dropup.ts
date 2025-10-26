import {CLICK, OUTSIDE_START, OUTSIDE_END} from '../../../../utils/consts/inputConstants';
import {PositionToButtons} from '../buttons/styleAdjustments/inputButtonPositions';
import {CLASS_LIST, CREATE_ELEMENT} from '../../../../utils/consts/htmlConstants';
import {GenericInputButtonStyles} from '../../../../types/genericInputButton';
import {DefinedButtonStateStyles} from '../../../../types/buttonInternal';
import {TooltipUtils} from '../buttons/tooltip/tooltipUtils';
import {DropupStyles} from '../../../../types/dropupStyles';
import {PLUS_ICON_STRING} from '../../../../icons/plusIcon';
import {CustomButton} from '../buttons/custom/customButton';
import {ButtonPosition} from '../../../../types/button';
import {Legacy} from '../../../../utils/legacy/legacy';
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
    this.elementRef[CLASS_LIST].add(Dropup.BUTTON_ICON_CLASS);
    this.buttonContainer.appendChild(this._menu.elementRef);
    this.reapplyStateStyle('styles');
    this.addContainerEvents(containerElement);
  }

  private static createButtonElement() {
    const buttonElement = CREATE_ELEMENT();
    buttonElement[CLASS_LIST].add('input-button');
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
    const buttonContainer = CREATE_ELEMENT();
    buttonContainer.id = 'dropup-container';
    return buttonContainer;
  }

  addItem(buttonProps: InputButton) {
    this._menu.addItem(buttonProps);
  }

  private addContainerEvents(containerElement: HTMLElement) {
    containerElement.addEventListener(CLICK, (event) => {
      const classes = (event.target as HTMLElement)[CLASS_LIST];
      if (!classes.contains(Dropup.BUTTON_ICON_CLASS) && !classes.contains(CustomButton.DISABLED_CONTAINER_CLASS)) {
        this._menu.close();
      }
    });
  }

  static getPosition(pToBs: PositionToButtons, dropupStyles?: DropupStyles) {
    if (dropupStyles?.button?.position) {
      return Legacy.processPosition<ButtonPosition>(dropupStyles?.button?.position);
    }
    if (pToBs[OUTSIDE_START].length > 0 && pToBs[OUTSIDE_END].length === 0) {
      return OUTSIDE_END;
    }
    return OUTSIDE_START;
  }
}
