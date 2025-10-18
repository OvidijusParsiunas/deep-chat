import {CLASS_LIST, CREATE_ELEMENT, STYLE} from '../../../utils/consts/htmlConstants';
import {Avatars, AvatarStyles, CustomAvatars} from '../../../types/avatars';
import aiLogoUrl from '../../../../assets/machine-learning.svg';
import {AI, USER} from '../../../utils/consts/messageConstants';
import avatarUrl from '../../../../assets/person-avatar.png';
import {DEFAULT} from '../../../utils/consts/inputConstants';
import {Role} from './role';

export class Avatar extends Role {
  private readonly _avatars: Avatars;

  constructor(avatars: Avatars) {
    super('avatar-container');
    this._avatars = avatars;
  }

  public addBesideBubble(messageText: HTMLElement, role: string) {
    const styles = typeof this._avatars === 'boolean' ? undefined : this._avatars;
    const avatarContainerElement = this.createAvatar(role, styles);
    const position = this.getPosition(role, styles);
    avatarContainerElement[CLASS_LIST].add(position === 'left' ? 'left-item-position' : 'right-item-position');
    messageText.insertAdjacentElement(position === 'left' ? 'beforebegin' : 'afterend', avatarContainerElement);
  }

  private createAvatar(role: string, avatars?: CustomAvatars) {
    const avatar = CREATE_ELEMENT('img') as HTMLImageElement;
    if (role === USER) {
      avatar.src = avatars?.[USER]?.src || avatars?.[DEFAULT]?.src || avatarUrl;
      avatar.onerror = Avatar.errorFallback.bind(this, avatarUrl);
    } else {
      avatar.src = avatars?.[role]?.src || avatars?.[AI]?.src || avatars?.[DEFAULT]?.src || aiLogoUrl;
      avatar.onerror = Avatar.errorFallback.bind(this, aiLogoUrl);
    }
    avatar[CLASS_LIST].add('avatar');
    avatar.alt = `${role} avatar`;
    const avatarContainer = CREATE_ELEMENT();
    avatarContainer[CLASS_LIST].add(this.className);
    avatarContainer.appendChild(avatar);
    if (avatars) Avatar.applyCustomStyles(avatarContainer, avatar, avatars, role);
    return avatarContainer;
  }

  private getPosition(role: string, avatars?: CustomAvatars) {
    let position: AvatarStyles['position'] | undefined = avatars?.[role]?.styles?.position;
    if (role !== USER) position ??= avatars?.ai?.styles?.position;
    position ??= avatars?.[DEFAULT]?.styles?.position;
    position ??= role === USER ? 'right' : 'left';
    return position;
  }

  private static errorFallback(fallbackLogo: string, e: Event | string) {
    const target = (e as Event).target as HTMLImageElement;
    target.onerror = null; // Prevent infinite loop if fallback also fails
    target.src = fallbackLogo;
  }

  private static applyCustomStylesToElements(container: HTMLElement, avatar: HTMLElement, style: AvatarStyles) {
    Object.assign(container[STYLE], style.container);
    Object.assign(avatar[STYLE], style.avatar);
  }

  private static applyCustomStyles(container: HTMLElement, avatar: HTMLElement, avatars: CustomAvatars, role: string) {
    if (avatars[DEFAULT]?.styles) Avatar.applyCustomStylesToElements(container, avatar, avatars[DEFAULT].styles);
    if (role === USER) {
      if (avatars.user?.styles) Avatar.applyCustomStylesToElements(container, avatar, avatars.user.styles);
    } else {
      if (avatars.ai?.styles) Avatar.applyCustomStylesToElements(container, avatar, avatars.ai.styles);
      const customRoleStyles = avatars[role]?.styles;
      if (customRoleStyles) Avatar.applyCustomStylesToElements(container, avatar, customRoleStyles);
    }
  }
}
