export class DropupMenu {
  readonly elementRef: HTMLElement;

  constructor() {
    this.elementRef = document.createElement('div');
    this.elementRef.id = 'dropup-menu';
  }

  open() {
    this.elementRef.style.display = 'block';
  }

  close() {
    this.elementRef.style.display = 'none';
  }
}
