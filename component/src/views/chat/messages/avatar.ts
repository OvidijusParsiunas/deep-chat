import {Avatars, AvatarStyles, CustomAvatars} from '../../../types/avatars';
import aiLogoUrl from '../../../../assets/machine-learning.svg';
import avatarUrl from '../../../../assets/person-avatar.png';

export class AvatarEl {
  private static applyCustomStylesToElements(container: HTMLElement, avatar: HTMLElement, style: AvatarStyles) {
    Object.assign(container.style, style.container);
    Object.assign(avatar.style, style.avatar);
  }

  // prettier-ignore
  private static applyCustomStyles(container: HTMLElement, avatar: HTMLElement,
      avatars: CustomAvatars, isAI: boolean) {
    if (avatars.default?.styles) AvatarEl.applyCustomStylesToElements(container, avatar, avatars.default.styles);
    if (isAI) {
      if (avatars.ai?.styles) AvatarEl.applyCustomStylesToElements(container, avatar, avatars.ai.styles);
    } else if (avatars.user?.styles) {
      AvatarEl.applyCustomStylesToElements(container, avatar, avatars.user.styles);
    }
  }

  private static createAvatar(isAI: boolean, avatars?: CustomAvatars) {
    const avatar = document.createElement('img');
    if (isAI) {
      avatar.src = avatars?.ai?.src || aiLogoUrl;
    } else {
      avatar.src = avatars?.user?.src || avatarUrl;
    }
    avatar.classList.add('avatar', isAI ? 'ai-avatar' : 'user-avatar');
    const avatarContainer = document.createElement('div');
    avatarContainer.classList.add('avatar-container');
    avatarContainer.appendChild(avatar);
    if (avatars) AvatarEl.applyCustomStyles(avatarContainer, avatar, avatars, isAI);
    return avatarContainer;
  }

  // prettier-ignore
  private static getPosition(isAI: boolean, avatars?: CustomAvatars) {
    let position: AvatarStyles['position'] | undefined = isAI
      ? avatars?.ai?.styles?.position : avatars?.user?.styles?.position;
    position ??= avatars?.default?.styles?.position;
    position ??= isAI ? 'left' : 'right';
    return position;
  }

  public static add(messageText: HTMLElement, isAI: boolean, avatars: Avatars) {
    const styles = typeof avatars === 'boolean' ? undefined : avatars;
    const avatar = AvatarEl.createAvatar(isAI, styles);
    const position = AvatarEl.getPosition(isAI, styles);
    messageText.insertAdjacentElement(position === 'left' ? 'beforebegin' : 'afterend', avatar);
  }
}
