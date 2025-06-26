import {DefinedButtonStateStyles, DefinedButtonInnerElements, ButtonInnerElement} from '../../../types/buttonInternal';
import {OpenAIRealtimeButton as OpenAIRealtimeButtonT} from '../../../types/openAIRealtime';
import {ButtonInnerElements} from '../../../views/chat/input/buttons/buttonInnerElements';
import {InputButton} from '../../../views/chat/input/buttons/inputButton';
import {ButtonCSS} from '../../../views/chat/input/buttons/buttonCSS';

type Styles = DefinedButtonStateStyles<OpenAIRealtimeButtonT>;

export class OpenAIRealtimeButton extends InputButton<Styles> {
  private static readonly EMPTY_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"></svg>';
  private readonly _innerElements: DefinedButtonInnerElements<Styles>;
  isActive = false;

  constructor(styles?: OpenAIRealtimeButtonT) {
    const svg = styles?.default?.svg?.content || OpenAIRealtimeButton.EMPTY_SVG;
    super(document.createElement('div'), svg, undefined, undefined, styles);
    this._innerElements = this.createInnerElementsForStates(this.customStyles);
    this.changeToDefault();
  }

  private createInnerElementsForStates(customStyles?: Styles) {
    return {
      default: this.createInnerButtonElements('default', customStyles),
      active: this.createInnerButtonElements('active', customStyles),
      unavailable: this.createInnerButtonElements('unavailable', customStyles),
    };
  }

  private createInnerButtonElements(state: keyof OpenAIRealtimeButton['_innerElements'], customStyles?: Styles) {
    return ButtonInnerElements.createCustomElements(state, this.svg, customStyles) || [this.svg];
  }

  protected changeState(innerElements: ButtonInnerElement[]) {
    this.changeElementsByState(innerElements);
    this.elementRef.classList.replace(ButtonInnerElements.INPUT_BUTTON_SVG_CLASS, 'deep-chat-openai-realtime-button');
  }

  public changeToActive() {
    this.changeState(this._innerElements.active);
    this.reapplyStateStyle('active', ['unavailable', 'default']);
    this.isActive = true;
  }

  public changeToDefault() {
    this.changeState(this._innerElements.default);
    if (this.customStyles?.active) ButtonCSS.unsetAllCSS(this.elementRef, this.customStyles?.active);
    if (this.customStyles?.unavailable) ButtonCSS.unsetAllCSS(this.elementRef, this.customStyles?.unavailable);
    this.reapplyStateStyle('default', ['active', 'unavailable']);
    this.isActive = false;
  }

  public changeToUnavailable() {
    this.changeState(this._innerElements.unavailable);
    if (this.customStyles?.active) ButtonCSS.unsetAllCSS(this.elementRef, this.customStyles?.active);
    if (this.customStyles?.default) ButtonCSS.unsetAllCSS(this.elementRef, this.customStyles?.default);
    this.reapplyStateStyle('unavailable', ['default', 'active']);
    this.isActive = false;
  }
}
