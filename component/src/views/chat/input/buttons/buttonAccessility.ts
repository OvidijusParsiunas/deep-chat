export class ButtonAccessibility {
  public static addAttributes(button: HTMLElement) {
    button.role = 'button';
    button.setAttribute('tabindex', '0');
  }

  public static addAriaBusy(button: HTMLElement) {
    button.setAttribute('aria-busy', 'true');
  }

  public static removeAriaBusy(button: HTMLElement) {
    button.removeAttribute('aria-busy');
  }

  public static addAriaDisabled(button: HTMLElement) {
    button.setAttribute('aria-disabled', 'true');
  }

  public static removeAriaDisabled(button: HTMLElement) {
    button.removeAttribute('aria-disabled');
  }

  public static removeAriaAttributes(button: HTMLElement) {
    ButtonAccessibility.removeAriaBusy(button);
    ButtonAccessibility.removeAriaDisabled(button);
  }
}
