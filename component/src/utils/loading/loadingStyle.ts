import {MessageStyles} from '../../types/messages';
import {CustomStyle} from '../../types/styles';

export class LoadingStyle {
  public static readonly BUBBLE_CLASS = 'deep-chat-loading-message-bubble';
  public static readonly DOTS_CONTAINER_CLASS = 'deep-chat-loading-message-dots-container';

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

  public static setDots(bubbleElement: HTMLElement, messageStyles?: MessageStyles) {
    if (messageStyles?.loading?.message?.styles?.bubble?.color) {
      const color = LoadingStyle.colorToHex(messageStyles.loading.message.styles.bubble.color);
      bubbleElement.style.setProperty('--loading-message-color', color);
      bubbleElement.style.setProperty('--loading-message-color-fade', `${color}33`);
    } else {
      bubbleElement.style.setProperty('--loading-message-color', '#848484');
      bubbleElement.style.setProperty('--loading-message-color-fade', '#55555533');
    }
  }

  public static setRing(bubbleElement: HTMLElement, style?: CustomStyle) {
    const {color, width, height, margin, border} = style || {};
    if (color) {
      const hexColor = LoadingStyle.colorToHex(color);
      bubbleElement.style.setProperty('--loading-history-color', hexColor);
    } else {
      bubbleElement.style.setProperty('--loading-history-color', '#dbdbdb');
    }
    bubbleElement.style.setProperty('--loading-history-height', height || '57px');
    bubbleElement.style.setProperty('--loading-history-width', width || '57px');
    bubbleElement.style.setProperty('--loading-history-margin', margin || '7px');
    bubbleElement.style.setProperty('--loading-history-border', border || '6px');
  }
}
