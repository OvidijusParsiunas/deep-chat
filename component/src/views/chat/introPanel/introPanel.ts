import {CLASS_LIST, CREATE_ELEMENT, STYLE} from '../../../utils/consts/htmlConstants';

export class IntroPanel {
  readonly _elementRef: HTMLElement;
  private _isDisplayed = false;

  constructor(childElement: HTMLElement) {
    this._elementRef = this.createIntroPanelWithChild(childElement);
    this._isDisplayed = true;
  }

  private static createIntroPanel() {
    const introPanel = CREATE_ELEMENT();
    introPanel[CLASS_LIST].add('intro-panel');
    Object.assign(introPanel[STYLE]);
    return introPanel;
  }

  private createIntroPanelWithChild(childElement: HTMLElement) {
    const introPanel = IntroPanel.createIntroPanel();
    if (childElement[STYLE].display === 'none') childElement[STYLE].display = 'block';
    introPanel.appendChild(childElement);
    return introPanel;
  }

  public hide() {
    if (this._isDisplayed) {
      this._elementRef[STYLE].display = 'none';
      this._isDisplayed = false;
    }
  }

  public display() {
    if (!this._isDisplayed) {
      this._elementRef[STYLE].display = '';
      this._isDisplayed = true;
    }
  }
}
