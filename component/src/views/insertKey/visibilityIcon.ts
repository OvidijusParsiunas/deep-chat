import {CLASS_LIST, CREATE_ELEMENT, STYLE} from '../../utils/consts/htmlConstants';
import {NOT_VISIBLE_ICON_STRING} from '../../icons/notVisibilityIcon';
import {VISIBLE_ICON_STRING} from '../../icons/visibleIcon';
import {SVGIconUtils} from '../../utils/svg/svgIconUtils';
import {TEXT} from '../../utils/consts/messageConstants';

export class VisibilityIcon {
  private static readonly VISIBLE_ICON_ID = 'visible-icon';

  // prettier-ignore
  private static changeVisibility(inputElement: HTMLInputElement,
      visibleIcon: SVGGraphicsElement, notVisibleIcon: SVGGraphicsElement, event: MouseEvent) {
    const iconElement = event.target as SVGGraphicsElement;
    if (iconElement.id === VisibilityIcon.VISIBLE_ICON_ID) {
      visibleIcon[STYLE].display = 'none';
      notVisibleIcon[STYLE].display = 'block';
      inputElement.type = 'password';
    } else {
      visibleIcon[STYLE].display = 'block';
      notVisibleIcon[STYLE].display = 'none';
      inputElement.type = TEXT;
    }
  }

  private static createIconElement(iconString: string, id: string) {
    const iconElement = SVGIconUtils.createSVGElement(iconString);
    iconElement.id = id;
    iconElement[CLASS_LIST].add('visibility-icon');
    return iconElement;
  }

  // prettier-ignore
  public static create(inputElement: HTMLInputElement) {
    const iconContainerElement = CREATE_ELEMENT();
    iconContainerElement.id = 'visibility-icon-container';
    const visibleIconElement = VisibilityIcon.createIconElement(VISIBLE_ICON_STRING, VisibilityIcon.VISIBLE_ICON_ID);
    visibleIconElement[STYLE].display = 'none';
    iconContainerElement.appendChild(visibleIconElement);
    const notVisibleIconElement = VisibilityIcon.createIconElement(NOT_VISIBLE_ICON_STRING, 'not-visible-icon');
    iconContainerElement.appendChild(notVisibleIconElement);
    iconContainerElement.onclick = VisibilityIcon.changeVisibility.bind(this,
      inputElement, visibleIconElement, notVisibleIconElement);
    return iconContainerElement;
  }
}
