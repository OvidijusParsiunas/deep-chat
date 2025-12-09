import {HiddenMessages as HiddenMessagesT, ScrollButton as ScrollButtonT} from '../../../types/scrollToBottom';
import {CREATE_ELEMENT, STYLE} from '../../../utils/consts/htmlConstants';
import {StatefulEvents} from '../../../utils/element/statefulEvents';
import {ElementUtils} from '../../../utils/element/elementUtils';
import {DEFAULT} from '../../../utils/consts/inputConstants';
import {StyleUtils} from '../../../utils/element/styleUtils';
import {StatefulStyles} from '../../../types/styles';
import {MessagesBase} from './messagesBase';
import {HTMLUtils} from './html/htmlUtils';

export class ScrollButton {
  readonly hiddenElements = new Set<HTMLElement>();
  private readonly io?: IntersectionObserver;
  private readonly element?: HTMLElement;
  private readonly hiddenMessagesConfig?: HiddenMessagesT;
  private readonly scrollButtonConfig?: ScrollButtonT;
  private readonly _messages: MessagesBase;
  private isScrollButton = false;

  constructor(messages: MessagesBase, hiddenMessages?: boolean | HiddenMessagesT, scrollButton?: boolean | ScrollButtonT) {
    this._messages = messages;
    if (hiddenMessages) {
      this.hiddenMessagesConfig = typeof hiddenMessages === 'object' ? hiddenMessages : {};
      this.io = this.initIntersectionObserver(this._messages.elementRef);
    }
    if (scrollButton) this.scrollButtonConfig = typeof scrollButton === 'object' ? scrollButton : {};
    this.element = this.createElement();
    this._messages.elementRef.appendChild(this.element);
  }

  private initIntersectionObserver(messagesElement: HTMLElement) {
    return new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && this.hiddenElements.has(entry.target as HTMLElement)) {
            this.hiddenElements.delete(entry.target as HTMLElement);
            this.io?.unobserve(entry.target);
            this.updateHiddenElement();
          }
        });
      },
      {root: messagesElement, threshold: 0.1}
    );
  }

  private createElement() {
    const element = CREATE_ELEMENT();
    element.id = 'scroll-button';
    element.onclick = () => {
      const smoothScroll = this.isScrollButton
        ? this.scrollButtonConfig?.smoothScroll
        : this.hiddenMessagesConfig?.smoothScroll;
      const isAnimation = typeof smoothScroll === 'boolean' ? smoothScroll : true;
      if (this.isScrollButton || this.hiddenMessagesConfig?.clickScroll === 'last') {
        ElementUtils.scrollToBottom(this._messages, isAnimation);
      } else {
        const firstElement = this.hiddenElements.values().next().value;
        // using this instead of scrollIntoView as it caused the whole screen to scroll
        if (firstElement)
          this._messages.elementRef.scrollTo({
            left: 0,
            top: firstElement.offsetTop,
            behavior: isAnimation ? 'smooth' : 'auto',
          });
      }
    };
    HTMLUtils.apply(this._messages, element);
    return element;
  }

  private assignStyles(styles: StatefulStyles) {
    if (!this.element) return;
    Object.assign(this.element[STYLE], styles[DEFAULT]);
    const statefulStyles = StyleUtils.processStateful(styles);
    StatefulEvents.add(this.element, statefulStyles);
  }

  private updateHiddenElement() {
    if (this.element) {
      this.isScrollButton = false;
      const number = this.hiddenElements.size;
      const content = `${number} new message${number === 1 ? '' : 's'}`;
      if (this.hiddenMessagesConfig?.onUpdate) {
        const newContent = this.hiddenMessagesConfig.onUpdate(content, number);
        this.element.innerHTML = newContent;
        if (this.hiddenMessagesConfig?.styles) this.assignStyles(this.hiddenMessagesConfig.styles);
        HTMLUtils.apply(this._messages, this.element);
      } else {
        this.element.innerHTML = content;
      }
      this.element[STYLE].opacity = number ? '1' : '0';
    }
  }

  public updateHidden() {
    if (!this.hiddenMessagesConfig) return;
    const lastMessageContainer = this._messages.getFirstMessageContentEl()?.outerContainer;
    if (lastMessageContainer && !ElementUtils.isVisibleInParent(lastMessageContainer, this._messages.elementRef)) {
      this.hiddenElements.add(lastMessageContainer);
      this.io?.observe(lastMessageContainer);
      this.updateHiddenElement();
    }
  }

  public clearHidden() {
    this.hiddenElements.forEach((element) => this.io?.unobserve(element));
    this.hiddenElements.clear();
    this.updateHiddenElement();
  }

  private displayScroll() {
    if (this.element && this.element[STYLE].opacity !== '1') {
      this.element[STYLE].opacity = '1';
      this.element.innerHTML =
        this.scrollButtonConfig?.content || '<span style="font-size: 20px; user-select: none;">&darr;</span>';
      if (this.scrollButtonConfig?.styles) this.assignStyles(this.scrollButtonConfig.styles);
    }
  }

  private hideScroll() {
    if (this.element && this.element[STYLE].opacity !== '0') {
      this.element[STYLE].opacity = '0';
    }
  }

  public updateScroll() {
    if (ElementUtils.isScrollbarAtBottomOfElement(this._messages.elementRef, this.scrollButtonConfig?.scrollDelta || 60)) {
      this.hideScroll();
    } else {
      this.displayScroll();
      this.isScrollButton = true;
    }
  }
}
