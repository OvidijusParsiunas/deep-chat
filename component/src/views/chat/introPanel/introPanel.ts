import {CustomStyle} from '../../../types/styles';

export class IntroPanel {
  readonly _elementRef?: HTMLElement;
  private _isDisplayed = false;

  constructor(childElement?: HTMLElement, introPanelMarkUp?: string, introPanelStyle?: CustomStyle) {
    if (childElement) {
      this._elementRef = this.createIntroPanelWithChild(childElement, introPanelStyle);
      this._isDisplayed = true;
    } else if (introPanelMarkUp) {
      this._elementRef = this.createInternalIntroPanel(introPanelMarkUp, introPanelStyle);
      this._isDisplayed = true;
    }
  }

  private static createIntroPanel(introPanelStyle?: CustomStyle) {
    const introPanel = document.createElement('div');
    introPanel.classList.add('intro-panel');
    Object.assign(introPanel.style, introPanelStyle);
    return introPanel;
  }

  private createIntroPanelWithChild(childElement: HTMLElement, introPanelStyle?: CustomStyle) {
    const introPanel = IntroPanel.createIntroPanel(introPanelStyle);
    if (childElement.style.display === 'none') childElement.style.display = 'block';
    introPanel.appendChild(childElement);
    return introPanel;
  }

  private createInternalIntroPanel(introPanelMarkUp: string, introPanelStyle?: CustomStyle) {
    const introPanel = IntroPanel.createIntroPanel(introPanelStyle);
    introPanel.id = 'internal-intro-panel';
    introPanel.innerHTML = introPanelMarkUp;
    return introPanel;
  }

  public hide() {
    if (this._isDisplayed && this._elementRef) {
      this._elementRef.style.display = 'none';
      this._isDisplayed = false;
    }
  }

  public display() {
    if (!this._isDisplayed && this._elementRef) {
      this._elementRef.style.display = '';
      this._isDisplayed = true;
    }
  }
}
