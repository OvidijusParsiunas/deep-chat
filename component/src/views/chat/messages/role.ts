export class Role {
  protected className: string;

  constructor(className: string) {
    this.className = className;
  }

  public tryHide(innerContainer: HTMLElement) {
    (innerContainer.getElementsByClassName(this.className)[0] as HTMLElement).style.visibility ||= 'hidden';
  }

  public tryReveal(innerContainer: HTMLElement) {
    (innerContainer.getElementsByClassName(this.className)[0] as HTMLElement).style.visibility = '';
  }

  public trySoftRem(innerContainer: HTMLElement) {
    (innerContainer.getElementsByClassName(this.className)[0] as HTMLElement).classList.add('role-hidden');
  }
}
