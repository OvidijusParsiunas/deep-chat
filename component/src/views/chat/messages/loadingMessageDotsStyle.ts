import {MessageStyles} from '../../../types/messages';

export class LoadingMessageDotsStyle {
  private static colorToHex(color: string) {
    const dummyElement = document.createElement('div');
    dummyElement.style.color = color;
    document.body.appendChild(dummyElement);
    const computedColor = window.getComputedStyle(dummyElement).color;
    const hex = (computedColor.match(/\d+/g) as string[])
      .map((value) => parseInt(value).toString(16).padStart(2, '0'))
      .join('');
    return `#${hex}`;
  }

  public static set(bubbleElement: HTMLElement, messageStyles?: MessageStyles) {
    if (messageStyles?.loading?.bubble?.color) {
      const color = LoadingMessageDotsStyle.colorToHex(messageStyles?.loading?.bubble?.color);
      bubbleElement.style.setProperty('--message-dots-color', color);
      bubbleElement.style.setProperty('--message-dots-color-fade', `${color}33`);
    } else {
      bubbleElement.style.setProperty('--message-dots-color', '#848484');
      bubbleElement.style.setProperty('--message-dots-color-fade', '#55555533');
    }
  }
}
