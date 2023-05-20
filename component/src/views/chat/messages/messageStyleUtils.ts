import {MessageElementsStyles, MessageRoleStyles, MessageStyles} from '../../../types/messages';
import {OverrideTypes} from '../../../types/utilityTypes';
import {GenericObject} from '../../../types/object';
import {CustomStyle} from '../../../types/styles';
import {MessageElements} from './messages';

export class MessageStyleUtils {
  public static applyCustomStylesToElements(elements: MessageElements, isMedia: boolean, styles?: MessageElementsStyles) {
    if (!styles) return;
    Object.assign(elements.outerContainer.style, styles.outerContainer);
    Object.assign(elements.innerContainer.style, styles.innerContainer);
    Object.assign(elements.bubbleElement.style, styles.bubble);
    if (isMedia) Object.assign((elements.bubbleElement.children[0] as HTMLElement).style, styles.media);
  }

  private static applySideStyles(elements: MessageElements, isAI: boolean, media: boolean, styles?: MessageRoleStyles) {
    if (!styles) return;
    MessageStyleUtils.applyCustomStylesToElements(elements, media, styles.shared);
    if (isAI) {
      MessageStyleUtils.applyCustomStylesToElements(elements, media, styles.ai);
    } else {
      MessageStyleUtils.applyCustomStylesToElements(elements, media, styles.user);
    }
  }

  private static isMessageSideStyles(styles: MessageRoleStyles | MessageElementsStyles): styles is MessageRoleStyles {
    return !!(
      (styles as MessageRoleStyles).ai ||
      (styles as MessageRoleStyles).shared ||
      (styles as MessageRoleStyles).user
    );
  }

  // prettier-ignore
  public static applyCustomStyles(messageStyles: MessageStyles,
      elements: MessageElements, isAI: boolean, media: boolean, otherStyles?: MessageRoleStyles | MessageElementsStyles) {
    if (otherStyles && messageStyles.default !== otherStyles) {
      if (MessageStyleUtils.isMessageSideStyles(otherStyles)) {
        MessageStyleUtils.applySideStyles(elements, isAI, media, messageStyles.default);
        MessageStyleUtils.applySideStyles(elements, isAI, media, otherStyles);
      } else {
        // do not apply sides when not side related
        MessageStyleUtils.applyCustomStylesToElements(elements, media, messageStyles.default?.shared);
        MessageStyleUtils.applyCustomStylesToElements(elements, media, otherStyles);
      }
    } else {
      // just apply the default for all sides
      MessageStyleUtils.applySideStyles(elements, isAI, media, messageStyles.default);
    }
  }

  // prettier-ignore
  public static extractParticularSharedStyles(specificStyles: (keyof CustomStyle)[],
      otherStyles?: MessageRoleStyles): MessageElementsStyles | undefined {
    if (!otherStyles?.shared) return undefined;
    const sharedStyles = otherStyles.shared;
    const newElementStyles: Required<OverrideTypes<MessageElementsStyles, GenericObject>> = {
      outerContainer: {},
      innerContainer: {},
      bubble: {},
      media: {},
    };
    specificStyles.forEach((style) => {
      newElementStyles.outerContainer[style as keyof GenericObject] = sharedStyles.outerContainer?.[style] as string || '';
      newElementStyles.innerContainer[style as keyof GenericObject] = sharedStyles.innerContainer?.[style] as string || '';
      newElementStyles.bubble[style as keyof GenericObject] = sharedStyles.bubble?.[style] as string || '';
      newElementStyles.media[style as keyof GenericObject] = sharedStyles.media?.[style] as string || '';
    });
    
    return newElementStyles;
  }
}
