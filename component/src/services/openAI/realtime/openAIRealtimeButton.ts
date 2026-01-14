import {DefinedButtonStateStyles, DefinedButtonInnerElements, ButtonInnerElement} from '../../../types/buttonInternal';
import {OpenAIRealtimeButton as OpenAIRealtimeButtonT} from '../../../types/openAIRealtime';
import {ButtonInnerElements} from '../../../views/chat/input/buttons/buttonInnerElements';
import {CLASS_LIST, CREATE_ELEMENT} from '../../../utils/consts/htmlConstants';
import {InputButton} from '../../../views/chat/input/buttons/inputButton';
import {ButtonCSS} from '../../../views/chat/input/buttons/buttonCSS';
import {ACTIVE, DEFAULT} from '../../../utils/consts/inputConstants';

type Styles = DefinedButtonStateStyles<OpenAIRealtimeButtonT>;

export class OpenAIRealtimeButton extends InputButton<Styles> {
  private static readonly EMPTY_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"></svg>';
  private readonly _innerElements: DefinedButtonInnerElements<Styles>;
  isActive = false;

  constructor(styles?: OpenAIRealtimeButtonT) {
    const svg = styles?.[DEFAULT]?.svg?.content || OpenAIRealtimeButton.EMPTY_SVG;
    super(CREATE_ELEMENT(), svg, undefined, undefined, styles);
    this._innerElements = this.createInnerElementsForStates(this.customStyles);
    this.changeToDefault();
  }

  private createInnerElementsForStates(customStyles?: Styles) {
    return {
      [DEFAULT]: this.createInnerButtonElements(DEFAULT, customStyles),
      [ACTIVE]: this.createInnerButtonElements(ACTIVE, customStyles),
      unavailable: this.createInnerButtonElements('unavailable', customStyles),
    };
  }

  private createInnerButtonElements(state: keyof OpenAIRealtimeButton['_innerElements'], customStyles?: Styles) {
    return ButtonInnerElements.createCustomElements(state, this.svg, customStyles) || [this.svg];
  }

  protected changeState(innerElements: ButtonInnerElement[]) {
    this.changeElementsByState(innerElements);
    this.elementRef[CLASS_LIST].replace(ButtonInnerElements.INPUT_BUTTON_SVG_CLASS, 'deep-chat-openai-realtime-button');
  }

  public changeToActive() {
    this.changeState(this._innerElements[ACTIVE]);
    this.reapplyStateStyle(ACTIVE, ['unavailable', DEFAULT]);
    this.isActive = true;
  }

  public changeToDefault() {
    this.changeState(this._innerElements[DEFAULT]);
    if (this.customStyles?.[ACTIVE]) ButtonCSS.unsetAllCSS(this.elementRef, this.customStyles?.[ACTIVE]);
    if (this.customStyles?.unavailable) ButtonCSS.unsetAllCSS(this.elementRef, this.customStyles?.unavailable);
    this.reapplyStateStyle(DEFAULT, [ACTIVE, 'unavailable']);
    this.isActive = false;
  }

  public changeToUnavailable() {
    this.changeState(this._innerElements.unavailable);
    if (this.customStyles?.[ACTIVE]) ButtonCSS.unsetAllCSS(this.elementRef, this.customStyles?.[ACTIVE]);
    if (this.customStyles?.[DEFAULT]) ButtonCSS.unsetAllCSS(this.elementRef, this.customStyles?.[DEFAULT]);
    this.reapplyStateStyle('unavailable', [DEFAULT, ACTIVE]);
    this.isActive = false;
  }
}
