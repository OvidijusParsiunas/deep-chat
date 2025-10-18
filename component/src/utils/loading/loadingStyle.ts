import {CREATE_ELEMENT, STYLE} from '../consts/htmlConstants';
import {LoadingStyles} from '../../types/messages';
import {CustomStyle} from '../../types/styles';

export class LoadingStyle {
  public static readonly BUBBLE_CLASS = 'deep-chat-loading-message-bubble';
  public static readonly DOTS_CONTAINER_CLASS = 'deep-chat-loading-message-dots-container';

  private static colorToHex(color: string) {
    const dummyElement = CREATE_ELEMENT();
    dummyElement[STYLE].color = color;
    document.body.appendChild(dummyElement);
    const computedColor = window.getComputedStyle(dummyElement).color;
    const hex = (computedColor.match(/\d+/g) as string[])
      .map((value) => parseInt(value).toString(16).padStart(2, '0'))
      .join('');
    return `#${hex}`;
  }

  public static setDots(bubbleElement: HTMLElement, styles?: LoadingStyles) {
    if (styles?.styles?.bubble?.color) {
      const color = LoadingStyle.colorToHex(styles.styles.bubble.color);
      bubbleElement[STYLE].setProperty('--loading-message-color', color);
      bubbleElement[STYLE].setProperty('--loading-message-color-fade', `${color}33`);
    } else {
      bubbleElement[STYLE].setProperty('--loading-message-color', '#848484');
      bubbleElement[STYLE].setProperty('--loading-message-color-fade', '#55555533');
    }
  }

  public static setRing(bubbleElement: HTMLElement, style?: CustomStyle) {
    const {color, width, height, margin, border} = style || {};
    if (color) {
      const hexColor = LoadingStyle.colorToHex(color);
      bubbleElement[STYLE].setProperty('--loading-history-color', hexColor);
    } else {
      bubbleElement[STYLE].setProperty('--loading-history-color', '#dbdbdb');
    }
    bubbleElement[STYLE].setProperty('--loading-history-height', height || '57px');
    bubbleElement[STYLE].setProperty('--loading-history-width', width || '57px');
    bubbleElement[STYLE].setProperty('--loading-history-margin', margin || '7px');
    bubbleElement[STYLE].setProperty('--loading-history-border', border || '6px solid');
  }
}
