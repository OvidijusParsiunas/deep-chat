export class Role {
  protected className: string;

  constructor(className: string) {
    this.className = className;
  }

  public getAvatarContainer(innerContainer: HTMLElement) {
    return innerContainer.getElementsByClassName(this.className)[0] as HTMLElement;
  }

  public tryHide(innerContainer: HTMLElement) {
    this.getAvatarContainer(innerContainer).style.visibility ||= 'hidden';
  }

  public tryReveal(innerContainer: HTMLElement) {
    this.getAvatarContainer(innerContainer).style.visibility = '';
  }

  public trySoftRem(innerContainer: HTMLElement) {
    this.getAvatarContainer(innerContainer).classList.add('role-hidden');
  }
}
