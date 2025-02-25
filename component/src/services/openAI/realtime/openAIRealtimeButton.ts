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
    super(document.createElement('div'), undefined, styles);
    this._innerElements = this.createInnerElements(this._customStyles);
    this.changeToDefault();
  }

  private createInnerElements(customStyles?: Styles) {
    const baseInnerElement = SVGIconUtils.createSVGElement(
      customStyles?.default?.svg?.content || OpenAIRealtimeButton.EMPTY_SVG
    );
    return {
      default: this.createInnerElement(baseInnerElement, 'default', customStyles),
      active: this.createInnerElement(baseInnerElement, 'active', customStyles),
      unavailable: this.createInnerElement(baseInnerElement, 'unavailable', customStyles),
    };
  }

  // prettier-ignore
  private createInnerElement(baseButton: SVGGraphicsElement,
      state: keyof OpenAIRealtimeButton['_innerElements'], customStyles?: Styles) {
    return ButtonInnerElements.createSpecificStateElement(this.elementRef, state, customStyles) || baseButton;
  }

  public changeToActive() {
    this.elementRef.replaceChildren(this._innerElements.active);
    this.reapplyStateStyle('active', ['unavailable', 'default']);
    this.isActive = true;
  }

  public changeToDefault() {
    this.elementRef.replaceChildren(this._innerElements.default);
    if (this._customStyles?.active) ButtonCSS.unsetAllCSS(this.elementRef, this._customStyles?.active);
    if (this._customStyles?.unavailable) ButtonCSS.unsetAllCSS(this.elementRef, this._customStyles?.unavailable);
    this.reapplyStateStyle('default', ['active', 'unavailable']);
    this.isActive = false;
  }

  public changeToUnavailable() {
    this.elementRef.replaceChildren(this._innerElements.unavailable);
    if (this._customStyles?.active) ButtonCSS.unsetAllCSS(this.elementRef, this._customStyles?.active);
    if (this._customStyles?.default) ButtonCSS.unsetAllCSS(this.elementRef, this._customStyles?.default);
    this.reapplyStateStyle('unavailable', ['default', 'active']);
    this.isActive = false;
  }
}
