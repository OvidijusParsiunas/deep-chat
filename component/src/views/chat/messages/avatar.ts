import {CLASS_LIST, CREATE_ELEMENT, STYLE} from '../../../utils/consts/htmlConstants';
import {AI, END, SRC, START, USER} from '../../../utils/consts/messageConstants';
import {Avatars, AvatarStyles, CustomAvatars} from '../../../types/avatars';
import {DEFAULT, STYLES} from '../../../utils/consts/inputConstants';
import aiLogoUrl from '../../../../assets/machine-learning.svg';
import avatarUrl from '../../../../assets/person-avatar.png';
import {Legacy} from '../../../utils/legacy/legacy';
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
    avatarContainerElement[CLASS_LIST].add(position === START ? 'start-item-position' : 'end-item-position');
    messageText.insertAdjacentElement(position === START ? 'beforebegin' : 'afterend', avatarContainerElement);
  }

  private createAvatar(role: string, avatars?: CustomAvatars) {
    const avatar = CREATE_ELEMENT('img') as HTMLImageElement;
    if (role === USER) {
      avatar[SRC] = avatars?.[USER]?.[SRC] || avatars?.[DEFAULT]?.[SRC] || avatarUrl;
      avatar.onerror = Avatar.errorFallback.bind(this, avatarUrl);
    } else {
      avatar[SRC] = avatars?.[role]?.[SRC] || avatars?.[AI]?.[SRC] || avatars?.[DEFAULT]?.[SRC] || aiLogoUrl;
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
    let position = Legacy.processPosition<AvatarStyles['position'] | undefined>(avatars?.[role]?.[STYLES]?.position);
    if (role !== USER) position ??= avatars?.ai?.[STYLES]?.position;
    position ??= avatars?.[DEFAULT]?.[STYLES]?.position;
    position ??= role === USER ? END : START;
    return position;
  }

  private static errorFallback(fallbackLogo: string, e: Event | string) {
    const target = (e as Event).target as HTMLImageElement;
    target.onerror = null; // Prevent infinite loop if fallback also fails
    target[SRC] = fallbackLogo;
  }

  private static applyCustomStylesToElements(container: HTMLElement, avatar: HTMLElement, style: AvatarStyles) {
    Object.assign(container[STYLE], style.container);
    Object.assign(avatar[STYLE], style.avatar);
  }

  private static applyCustomStyles(container: HTMLElement, avatar: HTMLElement, avatars: CustomAvatars, role: string) {
    if (avatars[DEFAULT]?.[STYLES]) Avatar.applyCustomStylesToElements(container, avatar, avatars[DEFAULT][STYLES]);
    if (role === USER) {
      if (avatars.user?.[STYLES]) Avatar.applyCustomStylesToElements(container, avatar, avatars.user[STYLES]);
    } else {
      if (avatars.ai?.[STYLES]) Avatar.applyCustomStylesToElements(container, avatar, avatars.ai[STYLES]);
      const customRoleStyles = avatars[role]?.[STYLES];
      if (customRoleStyles) Avatar.applyCustomStylesToElements(container, avatar, customRoleStyles);
    }
  }
}
