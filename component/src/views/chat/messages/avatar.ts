import {Avatars, AvatarStyles, CustomAvatars} from '../../../types/avatars';
import aiLogoUrl from '../../../../assets/machine-learning.svg';
import avatarUrl from '../../../../assets/person-avatar.png';
import {MessageUtils} from './messageUtils';

export class Avatar {
  private static readonly CONTAINER_CLASS = 'avatar-container';

  public static hide(innerContainer: HTMLElement) {
    (innerContainer.getElementsByClassName(Avatar.CONTAINER_CLASS)[0] as HTMLElement).style.visibility ||= 'hidden';
  }

  public static reveal(innerContainer: HTMLElement) {
    (innerContainer.getElementsByClassName(Avatar.CONTAINER_CLASS)[0] as HTMLElement).style.visibility = '';
  }

  private static applyCustomStylesToElements(container: HTMLElement, avatar: HTMLElement, style: AvatarStyles) {
    Object.assign(container.style, style.container);
    Object.assign(avatar.style, style.avatar);
  }

  private static applyCustomStyles(container: HTMLElement, avatar: HTMLElement, avatars: CustomAvatars, role: string) {
    if (avatars.default?.styles) Avatar.applyCustomStylesToElements(container, avatar, avatars.default.styles);
    if (role === MessageUtils.USER_ROLE) {
      if (avatars.user?.styles) Avatar.applyCustomStylesToElements(container, avatar, avatars.user.styles);
    } else {
      if (avatars.ai?.styles) Avatar.applyCustomStylesToElements(container, avatar, avatars.ai.styles);
      const customRoleStyles = avatars[role]?.styles;
      if (customRoleStyles) Avatar.applyCustomStylesToElements(container, avatar, customRoleStyles);
    }
  }

  private static createAvatar(role: string, avatars?: CustomAvatars) {
    const avatar = document.createElement('img');
    if (role === MessageUtils.USER_ROLE) {
      avatar.src = avatars?.user?.src || avatars?.default?.src || avatarUrl;
    } else {
      avatar.src = avatars?.[role]?.src || avatars?.ai?.src || avatars?.default?.src || aiLogoUrl;
    }
    avatar.classList.add('avatar');
    const avatarContainer = document.createElement('div');
    avatarContainer.classList.add(Avatar.CONTAINER_CLASS);
    avatarContainer.appendChild(avatar);
    if (avatars) Avatar.applyCustomStyles(avatarContainer, avatar, avatars, role);
    return avatarContainer;
  }

  private static getPosition(role: string, avatars?: CustomAvatars) {
    let position: AvatarStyles['position'] | undefined = avatars?.[role]?.styles?.position;
    if (role !== MessageUtils.USER_ROLE) position ??= avatars?.ai?.styles?.position;
    position ??= avatars?.default?.styles?.position;
    position ??= role === MessageUtils.USER_ROLE ? 'right' : 'left';
    return position;
  }

  public static add(messageText: HTMLElement, role: string, avatars: Avatars) {
    const styles = typeof avatars === 'boolean' ? undefined : avatars;
    const avatarContainerElement = Avatar.createAvatar(role, styles);
    const position = Avatar.getPosition(role, styles);
    avatarContainerElement.classList.add(position === 'left' ? 'left-item-position' : 'right-item-position');
    messageText.insertAdjacentElement(position === 'left' ? 'beforebegin' : 'afterend', avatarContainerElement);
  }
}
