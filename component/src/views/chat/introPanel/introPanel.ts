export class IntroPanel {
  readonly _elementRef: HTMLElement;
  private _isDisplayed = false;

  constructor(childElement: HTMLElement) {
    this._elementRef = this.createIntroPanelWithChild(childElement);
    this._isDisplayed = true;
  }

  private static createIntroPanel() {
    const introPanel = document.createElement('div');
    introPanel.classList.add('intro-panel');
    Object.assign(introPanel.style);
    return introPanel;
  }

  private createIntroPanelWithChild(childElement: HTMLElement) {
    const introPanel = IntroPanel.createIntroPanel();
    if (childElement.style.display === 'none') childElement.style.display = 'block';
    introPanel.appendChild(childElement);
    return introPanel;
  }

  public hide() {
    if (this._isDisplayed) {
      this._elementRef.style.display = 'none';
      this._isDisplayed = false;
    }
  }

  public display() {
    if (!this._isDisplayed) {
      this._elementRef.style.display = '';
      this._isDisplayed = true;
    }
  }
}
