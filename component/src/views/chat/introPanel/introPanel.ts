import {CustomStyle} from '../../../types/styles';

export class IntroPanel {
  readonly _elementRef?: HTMLElement;
  private _isDisplayed = false;

  constructor(isSlotPopulated: boolean, introPanelMarkUp?: string, introPanelStyle?: CustomStyle) {
    if (isSlotPopulated) {
      this._elementRef = this.createSlot(introPanelStyle);
      this._isDisplayed = true;
    } else if (introPanelMarkUp) {
      this._elementRef = this.createInternalIntroPanel(introPanelMarkUp, introPanelStyle);
      this._isDisplayed = true;
    }
  }

  private createSlot(introPanelStyle?: CustomStyle) {
    const slot = document.createElement('slot');
    slot.classList.add('intro-panel');
    Object.assign(slot.style, introPanelStyle);
    return slot;
  }

  private createInternalIntroPanel(introPanelMarkUp: string, introPanelStyle?: CustomStyle) {
    const introPanel = document.createElement('div');
    introPanel.id = 'internal-intro-panel';
    introPanel.classList.add('intro-panel');
    introPanel.innerHTML = introPanelMarkUp;
    Object.assign(introPanel.style, introPanelStyle);
    return introPanel;
  }

  public hide() {
    if (this._isDisplayed && this._elementRef) {
      this._elementRef.style.display = 'none';
      this._isDisplayed = false;
    }
  }
}
