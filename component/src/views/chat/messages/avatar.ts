import {CustomAvatarStyle, CustomAvatarStyles} from '../../../types/messages';
import openAILogoUrl from '../../../../assets/open-ai-logo.png';
import avatarUrl from '../../../../assets/person-avatar.png';
import style from './avatar.css?inline';

export class Avatar {
  private static applyCustomAvatarStylesToElements(container: HTMLElement, avatar: HTMLElement, style: CustomAvatarStyle) {
    Object.assign(container.style, style.container);
    Object.assign(avatar.style, style.avatar);
  }

  // prettier-ignore
  private static applyCustomAvatarStyles(container: HTMLElement, avatar: HTMLElement, styles: CustomAvatarStyles, isAI: boolean) {
    if (styles.default) Avatar.applyCustomAvatarStylesToElements(container, avatar, styles.default);
    if (isAI) {
      if (styles.ai) Avatar.applyCustomAvatarStylesToElements(container, avatar, styles.ai);
    } else if (styles.user) {
      Avatar.applyCustomAvatarStylesToElements(container, avatar, styles.user);
    }
  }

  private static createAvatar(isAI: boolean, avatarStyles?: CustomAvatarStyles) {
    const avatar = document.createElement('img');
    avatar.src = isAI ? openAILogoUrl : avatarUrl;
    avatar.classList.add('avatar');
    const avatarContainer = document.createElement('div');
    avatarContainer.classList.add('avatar-container');
    avatarContainer.appendChild(avatar);
    if (avatarStyles) Avatar.applyCustomAvatarStyles(avatarContainer, avatar, avatarStyles, isAI);
    return avatarContainer;
  }

  public static addAvatar(messageText: HTMLElement, styles: CustomAvatarStyles, isAI: boolean) {
    let position: CustomAvatarStyle['position'] | undefined = isAI ? styles.ai?.position : styles.user?.position;
    if (!position) position = styles.default?.position;
    if (!position) position = isAI ? 'left' : 'right';
    messageText.insertAdjacentElement(position === 'left' ? 'beforebegin' : 'afterend', this.createAvatar(isAI, styles));
  }

  public static appendDefaultStyle(messages: HTMLElement) {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = style;
    messages.appendChild(styleElement);
  }

  public static canAvatarBeAdded(styles: CustomAvatarStyles) {
    return !!styles;
  }
}
