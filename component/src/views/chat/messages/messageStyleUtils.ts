import {MessageElementsStyles, MessageRoleStyles, MessageStyles} from '../../../types/messages';
import {OverrideTypes} from '../../../types/utilityTypes';
import {GenericObject} from '../../../types/object';
import {CustomStyle} from '../../../types/styles';
import {MessageUtils} from './messageUtils';
import {MessageElements} from './messages';

export class MessageStyleUtils {
  public static applyCustomStylesToElements(elements: MessageElements, isMedia: boolean, styles?: MessageElementsStyles) {
    if (!styles) return;
    Object.assign(elements.outerContainer.style, styles.outerContainer);
    Object.assign(elements.innerContainer.style, styles.innerContainer);
    Object.assign(elements.bubbleElement.style, styles.bubble);
    if (isMedia) {
      const bubbleContent = elements.bubbleElement.children[0] as HTMLElement;
      const mediaElement = bubbleContent.tagName.toLocaleLowerCase() !== 'a' ? bubbleContent : bubbleContent.children[0];
      Object.assign((mediaElement as HTMLElement).style, styles.media);
    }
  }

  private static applySideStyles(elements: MessageElements, role: string, media: boolean, styles?: MessageRoleStyles) {
    if (!styles) return;
    MessageStyleUtils.applyCustomStylesToElements(elements, media, styles.shared);
    if (role === MessageUtils.USER_ROLE) {
      MessageStyleUtils.applyCustomStylesToElements(elements, media, styles.user);
    } else {
      MessageStyleUtils.applyCustomStylesToElements(elements, media, styles.ai);
      MessageStyleUtils.applyCustomStylesToElements(elements, media, styles[role]);
    }
  }

  private static isElementsStyles(styles: MessageRoleStyles | MessageElementsStyles): styles is MessageElementsStyles {
    return !!(
      (styles as MessageElementsStyles).outerContainer ||
      (styles as MessageElementsStyles).innerContainer ||
      (styles as MessageElementsStyles).bubble ||
      (styles as MessageElementsStyles).media
    );
  }

  // prettier-ignore
  public static applyCustomStyles(messageStyles: MessageStyles,
      elements: MessageElements, role: string, media: boolean, otherStyles?: MessageRoleStyles | MessageElementsStyles) {
    if (otherStyles && messageStyles.default !== otherStyles) {
      if (MessageStyleUtils.isElementsStyles(otherStyles)) {
        MessageStyleUtils.applyCustomStylesToElements(elements, media, messageStyles.default?.shared);
        MessageStyleUtils.applyCustomStylesToElements(elements, media, otherStyles);
      } else {
        MessageStyleUtils.applySideStyles(elements, role, media, messageStyles.default);
        MessageStyleUtils.applySideStyles(elements, role, media, otherStyles);
      }
    } else {
      // just apply the default for all sides
      MessageStyleUtils.applySideStyles(elements, role, media, messageStyles.default);
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
