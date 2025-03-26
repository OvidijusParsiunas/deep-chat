import {Avatars, AvatarStyles, CustomAvatars} from '../../../types/avatars';
import aiLogoUrl from '../../../../assets/machine-learning.svg';
import avatarUrl from '../../../../assets/person-avatar.png';
import {MessageUtils} from './utils/messageUtils';
import {Role} from './role';

export class Avatar extends Role {
  private readonly _avatars: Avatars;

  constructor(avatars: Avatars) {
    super('avatar-container');
    this._avatars = avatars;
  }

  public addBesideMsg(messageText: HTMLElement, role: string) {
    const styles = typeof this._avatars === 'boolean' ? undefined : this._avatars;
    const avatarContainerElement = this.createAvatar(role, styles);
    const position = this.getPosition(role, styles);
    avatarContainerElement.classList.add(position === 'left' ? 'left-item-position' : 'right-item-position');
    messageText.insertAdjacentElement(position === 'left' ? 'beforebegin' : 'afterend', avatarContainerElement);
  }

  private createAvatar(role: string, avatars?: CustomAvatars) {
    const avatar = document.createElement('img');
    if (role === MessageUtils.USER_ROLE) {
      avatar.src = avatars?.user?.src || avatars?.default?.src || avatarUrl;
      avatar.onerror = Avatar.errorFallback.bind(this, avatarUrl);
    } else {
      avatar.src = avatars?.[role]?.src || avatars?.ai?.src || avatars?.default?.src || aiLogoUrl;
      avatar.onerror = Avatar.errorFallback.bind(this, aiLogoUrl);
    }
    avatar.classList.add('avatar');
    avatar.alt = `${role} avatar`;
    const avatarContainer = document.createElement('div');
    avatarContainer.classList.add(this.className);
    avatarContainer.appendChild(avatar);
    if (avatars) Avatar.applyCustomStyles(avatarContainer, avatar, avatars, role);
    return avatarContainer;
  }

  private getPosition(role: string, avatars?: CustomAvatars) {
    let position: AvatarStyles['position'] | undefined = avatars?.[role]?.styles?.position;
    if (role !== MessageUtils.USER_ROLE) position ??= avatars?.ai?.styles?.position;
    position ??= avatars?.default?.styles?.position;
    position ??= role === MessageUtils.USER_ROLE ? 'right' : 'left';
    return position;
  }

  private static errorFallback(fallbackLogo: string, e: Event | string) {
    const target = (e as Event).target as HTMLImageElement;
    target.onerror = null; // Prevent infinite loop if fallback also fails
    target.src = fallbackLogo;
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
}
