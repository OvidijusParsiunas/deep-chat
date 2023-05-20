import {Names, Name as NameT, CustomNames} from '../../../types/names';

export class Name {
  private static getPosition(isAI: boolean, names: CustomNames) {
    let position: NameT['position'] | undefined = isAI ? names?.ai?.position : names?.user?.position;
    if (!position) position = names?.default?.position;
    if (!position) position = isAI ? 'left' : 'right';
    return position;
  }

  private static applyStyle(element: HTMLElement, isAI: boolean, names: CustomNames) {
    Object.assign(element.style, names.default?.style, isAI ? names.ai?.style : names.user?.style);
  }

  private static getNameText(isAI: boolean, names: CustomNames) {
    if (isAI) {
      return names.ai?.text || 'AI';
    }
    return names.user?.text || 'User';
  }

  private static createName(isAI: boolean, names: CustomNames) {
    const element = document.createElement('div');
    element.classList.add('name');
    element.textContent = Name.getNameText(isAI, names);
    Name.applyStyle(element, isAI, names);
    return element;
  }

  public static add(messageText: HTMLElement, isAI: boolean, names: Names) {
    const customConfig = typeof names === 'boolean' ? {} : names;
    const nameElement = Name.createName(isAI, customConfig);
    const position = Name.getPosition(isAI, customConfig);
    nameElement.classList.add(position === 'left' ? 'left-item-position' : 'right-item-position');
    messageText.insertAdjacentElement(position === 'left' ? 'beforebegin' : 'afterend', nameElement);
  }
}
