import {CLASS_LIST, CREATE_ELEMENT, STYLE} from '../../../utils/consts/htmlConstants';
import {Names, Name as NameT, CustomNames} from '../../../types/names';
import {USER, AI, TEXT} from '../../../utils/consts/messageConstants';
import {DEFAULT} from '../../../utils/consts/inputConstants';
import {Role} from './role';

export class Name extends Role {
  private readonly _names: Names;

  constructor(names: Names) {
    super('name');
    this._names = names;
  }

  public addBesideBubble(messageText: HTMLElement, role: string) {
    const customConfig = typeof this._names === 'boolean' ? {} : this._names;
    const nameElement = this.createName(role, customConfig);
    const position = Name.getPosition(role, customConfig);
    nameElement[CLASS_LIST].add(position === 'left' ? 'left-item-position' : 'right-item-position');
    messageText.insertAdjacentElement(position === 'left' ? 'beforebegin' : 'afterend', nameElement);
  }

  private createName(role: string, names: CustomNames) {
    const element = CREATE_ELEMENT();
    element[CLASS_LIST].add(this.className);
    element.textContent = Name.getNameText(role, names);
    Name.applyStyle(element, role, names);
    return element;
  }

  private static getPosition(role: string, names: CustomNames) {
    let position: NameT['position'] | undefined = names?.[role]?.position;
    if (role !== USER) position ??= names?.[AI]?.position;
    position ??= names?.[DEFAULT]?.position;
    position ??= role === USER ? 'right' : 'left';
    return position;
  }

  private static applyStyle(element: HTMLElement, role: string, names: CustomNames) {
    Object.assign(element[STYLE], names[DEFAULT]?.[STYLE]);
    if (role === USER) {
      Object.assign(element[STYLE], names[USER]?.[STYLE]);
    } else {
      Object.assign(element[STYLE], names[AI]?.[STYLE]);
      Object.assign(element[STYLE], names[role]?.[STYLE]);
    }
  }

  private static getNameText(role: string, names: CustomNames) {
    if (role === USER) {
      return names[USER]?.[TEXT] || names[DEFAULT]?.[TEXT] || 'User';
    }
    if (role === AI) {
      return names[AI]?.[TEXT] || names[DEFAULT]?.[TEXT] || 'AI';
    }
    return names[role]?.[TEXT] || names[DEFAULT]?.[TEXT] || role;
  }
}
