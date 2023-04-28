import {MessageElementStyles, MessageSideStyles, MessageStyles} from '../../../types/messages';
import {MessageElements} from './messages';

export class MessageStyleUtils {
  private static applyCustomStylesToElements(elements: MessageElements, isMedia: boolean, styles?: MessageElementStyles) {
    if (!styles) return;
    Object.assign(elements.outerContainer.style, styles.outerContainer);
    Object.assign(elements.innerContainer.style, styles.innerContainer);
    Object.assign(elements.bubbleElement.style, styles.bubble);
    if (isMedia) Object.assign((elements.bubbleElement.children[0] as HTMLElement).style, styles.media);
  }

  private static applySideStyles(elements: MessageElements, isAI: boolean, media: boolean, styles: MessageSideStyles) {
    MessageStyleUtils.applyCustomStylesToElements(elements, media, styles.shared);
    if (isAI) {
      MessageStyleUtils.applyCustomStylesToElements(elements, media, styles.ai);
    } else {
      MessageStyleUtils.applyCustomStylesToElements(elements, media, styles.user);
    }
  }

  private static isMessageSideStyles(styles: MessageSideStyles | MessageElementStyles): styles is MessageSideStyles {
    return !!(
      (styles as MessageSideStyles).ai ||
      (styles as MessageSideStyles).shared ||
      (styles as MessageSideStyles).user
    );
  }

  // prettier-ignore
  public static applyCustomStyles(messageStyles: MessageStyles,
      elements: MessageElements, isAI: boolean, media: boolean, otherStyles?: MessageSideStyles | MessageElementStyles) {
    if (messageStyles.default) MessageStyleUtils.applySideStyles(elements, isAI, media, messageStyles.default);
    if (otherStyles && messageStyles.default !== otherStyles) {
      if (MessageStyleUtils.isMessageSideStyles(otherStyles)) {
        MessageStyleUtils.applySideStyles(elements, isAI, media, otherStyles);
      } else {
        MessageStyleUtils.applyCustomStylesToElements(elements, media, otherStyles);
      }
    }
  }
}
