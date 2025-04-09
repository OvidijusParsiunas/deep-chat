import {DefinedButtonStateStyles, DefinedButtonInnerElements} from '../../../types/buttonInternal';
import {OpenAIRealtimeButton as OpenAIRealtimeButtonT} from '../../../types/openAIRealtime';
import {ButtonInnerElements} from '../../../views/chat/input/buttons/buttonInnerElements';
import {InputButton} from '../../../views/chat/input/buttons/inputButton';
import {ButtonCSS} from '../../../views/chat/input/buttons/buttonCSS';
import {SVGIconUtils} from '../../../utils/svg/svgIconUtils';

type Styles = DefinedButtonStateStyles<OpenAIRealtimeButtonT>;

export class OpenAIRealtimeButton extends InputButton<Styles> {
  private static readonly EMPTY_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"></svg>';
  private readonly _innerElements: DefinedButtonInnerElements<Styles>;
  isActive = false;

  constructor(styles?: OpenAIRealtimeButtonT) {
    const baseInnerElement = SVGIconUtils.createSVGElement(
      styles?.default?.svg?.content || OpenAIRealtimeButton.EMPTY_SVG
    );
    super(document.createElement('div'), baseInnerElement, undefined, styles);
    this._innerElements = this.createInnerElementsForStates(this.customStyles);
    this.changeToDefault();
  }

  private createInnerElementsForStates(customStyles?: Styles) {
    return {
      default: this.createInnerElements('default', customStyles),
      active: this.createInnerElements('active', customStyles),
      unavailable: this.createInnerElements('unavailable', customStyles),
    };
  }

  private createInnerElements(state: keyof OpenAIRealtimeButton['_innerElements'], customStyles?: Styles) {
    return ButtonInnerElements.createCustomElements(state, customStyles) || [this.svg];
  }

  public changeToActive() {
    this.changeElementsByState(this._innerElements.active);
    this.reapplyStateStyle('active', ['unavailable', 'default']);
    this.isActive = true;
  }

  public changeToDefault() {
    this.changeElementsByState(this._innerElements.default);
    if (this.customStyles?.active) ButtonCSS.unsetAllCSS(this.elementRef, this.customStyles?.active);
    if (this.customStyles?.unavailable) ButtonCSS.unsetAllCSS(this.elementRef, this.customStyles?.unavailable);
    this.reapplyStateStyle('default', ['active', 'unavailable']);
    this.isActive = false;
  }

  public changeToUnavailable() {
    this.changeElementsByState(this._innerElements.unavailable);
    if (this.customStyles?.active) ButtonCSS.unsetAllCSS(this.elementRef, this.customStyles?.active);
    if (this.customStyles?.default) ButtonCSS.unsetAllCSS(this.elementRef, this.customStyles?.default);
    this.reapplyStateStyle('unavailable', ['default', 'active']);
    this.isActive = false;
  }
}
