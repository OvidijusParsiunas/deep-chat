import {Avatars, CustomAvatarStyle, CustomAvatarStyles} from '../../../types/avatar';
import openAILogoUrl from '../../../../assets/open-ai-logo.png';
import avatarUrl from '../../../../assets/person-avatar.png';

export class Avatar {
  private static applyCustomStylesToElements(container: HTMLElement, avatar: HTMLElement, style: CustomAvatarStyle) {
    Object.assign(container.style, style.container);
    Object.assign(avatar.style, style.avatar);
  }

  // prettier-ignore
  private static applyCustomStyles(container: HTMLElement, avatar: HTMLElement,
      styles: CustomAvatarStyles, isAI: boolean) {
    if (styles.default) Avatar.applyCustomStylesToElements(container, avatar, styles.default);
    if (isAI) {
      if (styles.ai) Avatar.applyCustomStylesToElements(container, avatar, styles.ai);
    } else if (styles.user) {
      Avatar.applyCustomStylesToElements(container, avatar, styles.user);
    }
  }

  private static createAvatar(isAI: boolean, styles?: CustomAvatarStyles) {
    const avatar = document.createElement('img');
    avatar.src = isAI ? openAILogoUrl : avatarUrl;
    avatar.classList.add('avatar');
    const avatarContainer = document.createElement('div');
    avatarContainer.classList.add('avatar-container');
    avatarContainer.appendChild(avatar);
    if (styles) Avatar.applyCustomStyles(avatarContainer, avatar, styles, isAI);
    return avatarContainer;
  }

  private static getPosition(isAI: boolean, styles?: CustomAvatarStyles) {
    let position: CustomAvatarStyle['position'] | undefined = isAI ? styles?.ai?.position : styles?.user?.position;
    if (!position) position = styles?.default?.position;
    if (!position) position = isAI ? 'left' : 'right';
    return position;
  }

  public static addAvatar(messageText: HTMLElement, isAI: boolean, avatars: Avatars) {
    const styles = typeof avatars === 'boolean' ? undefined : avatars.styles;
    const position = Avatar.getPosition(isAI, styles);
    messageText.insertAdjacentElement(position === 'left' ? 'beforebegin' : 'afterend', Avatar.createAvatar(isAI, styles));
  }
}
