import {Names, Name as NameT, CustomNames} from '../../../types/names';
import {MessageUtils} from './utils/messageUtils';
import {Role} from './role';

export class Name extends Role {
  private readonly _names: Names;

  constructor(names: Names) {
    super('name');
    this._names = names;
  }

  public addBesideMsg(messageText: HTMLElement, role: string) {
    const customConfig = typeof this._names === 'boolean' ? {} : this._names;
    const nameElement = this.createName(role, customConfig);
    const position = Name.getPosition(role, customConfig);
    nameElement.classList.add(position === 'left' ? 'left-item-position' : 'right-item-position');
    messageText.insertAdjacentElement(position === 'left' ? 'beforebegin' : 'afterend', nameElement);
  }

  private createName(role: string, names: CustomNames) {
    const element = document.createElement('div');
    element.classList.add(this.className);
    element.textContent = Name.getNameText(role, names);
    Name.applyStyle(element, role, names);
    return element;
  }

  private static getPosition(role: string, names: CustomNames) {
    let position: NameT['position'] | undefined = names?.[role]?.position;
    if (role !== MessageUtils.USER_ROLE) position ??= names?.ai?.position;
    position ??= names?.default?.position;
    position ??= role === MessageUtils.USER_ROLE ? 'right' : 'left';
    return position;
  }

  private static applyStyle(element: HTMLElement, role: string, names: CustomNames) {
    Object.assign(element.style, names.default?.style);
    if (role === MessageUtils.USER_ROLE) {
      Object.assign(element.style, names.user?.style);
    } else {
      Object.assign(element.style, names.ai?.style);
      Object.assign(element.style, names[role]?.style);
    }
  }

  private static getNameText(role: string, names: CustomNames) {
    if (role === MessageUtils.USER_ROLE) {
      return names.user?.text || names.default?.text || 'User';
    }
    if (role === MessageUtils.AI_ROLE) {
      return names.ai?.text || names.default?.text || 'AI';
    }
    return names[role]?.text || names.default?.text || role;
  }
}
