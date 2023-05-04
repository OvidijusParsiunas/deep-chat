import {KEYBOARD_KEY} from '../../../../utils/buttons/keyboardKeys';
import {DropupMenuStyles} from '../../../../types/dropupStyles';
import {DropupItemNavigation} from './dropupItemNavigation';
import {CustomStyle} from '../../../../types/styles';
import {InputButton} from '../buttons/inputButton';
import {DropupItem} from './dropupItem';

export class DropupMenu {
  readonly elementRef: HTMLElement;
  private _isOpen = true;
  highlightedItem?: HTMLElement;
  private readonly _styles?: DropupMenuStyles;

  constructor(containerElement: HTMLElement, styles?: DropupMenuStyles) {
    this._styles = styles;
    this.elementRef = DropupMenu.createElement(this._styles?.container);
    this.close();
    setTimeout(() => this.addWindowEvents(containerElement));
  }

  private static createElement(containerStyle?: CustomStyle) {
    const menuElement = document.createElement('div');
    menuElement.id = 'dropup-menu';
    Object.assign(menuElement.style, containerStyle);
    return menuElement;
  }

  private open() {
    this.elementRef.style.display = 'block';
    this._isOpen = true;
  }

  close() {
    if (this._isOpen) {
      this.elementRef.style.display = 'none';
      this._isOpen = false;
    }
  }

  toggle() {
    if (this._isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  addItem(inputButton: InputButton) {
    const item = DropupItem.createItem(this, inputButton, this._styles);
    this.elementRef.appendChild(item);
  }

  // prettier-ignore
  private addWindowEvents(containerElement: HTMLElement) {
    window.addEventListener('click', (event) => {
      // a really inconvenient way of making sure that the target element is not this component
      // can refactor in the future if needed
      if (containerElement.parentElement !== (event.target as HTMLElement).shadowRoot?.children[0]) {
        this.close();
      }
    });
    window.addEventListener('keydown', (event) => {
      if (this._isOpen) {
        if (event.key === KEYBOARD_KEY.ESCAPE) {
          this.close();
          this.highlightedItem?.dispatchEvent(new MouseEvent('mouseleave'));
        } else if (event.key === KEYBOARD_KEY.ENTER) {
          this.highlightedItem?.click();
          this.highlightedItem?.dispatchEvent(new MouseEvent('mouseleave'));
        } else if (event.key === KEYBOARD_KEY.ARROW_DOWN) {
          DropupItemNavigation.focusSiblingItem(
            this.highlightedItem || this.elementRef.children[this.elementRef.children.length - 1] as HTMLElement,
            this.elementRef, true);
        } else if (event.key === KEYBOARD_KEY.ARROW_UP) {
          DropupItemNavigation.focusSiblingItem(
            this.highlightedItem || this.elementRef.children[0] as HTMLElement, this.elementRef, false);
        }
      }
    });
  }
}
