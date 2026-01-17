import {HiddenMessages as HiddenMessagesT, ScrollButton as ScrollButtonT} from '../../../types/scrollToBottom';
import {DEEP_COPY, ONE, ZERO} from '../../../utils/consts/messageConstants';
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
  private isScrollingToBottom = false;

  constructor(messages: MessagesBase, hiddenMessages?: boolean | HiddenMessagesT, scrollButton?: boolean | ScrollButtonT) {
    this._messages = messages;
    if (hiddenMessages) {
      let config: HiddenMessagesT = {};
      if (typeof hiddenMessages === 'object') {
        config = DEEP_COPY(hiddenMessages);
        config.onUpdate = hiddenMessages.onUpdate;
      }
      config.styles ??= {};
      const fitContent = 'fit-content';
      config.styles.default = {borderRadius: '10px', width: fitContent, height: fitContent, ...config.styles.default};
      this.hiddenMessagesConfig = config;
      this.io = this.initIntersectionObserver(this._messages.elementRef);
    }
    if (scrollButton) {
      const config: ScrollButtonT = typeof scrollButton === 'object' ? DEEP_COPY(scrollButton) : {};
      config.styles ??= {};
      config.styles.default = {borderRadius: '50%', width: '1.4rem', height: '1.4rem', ...config.styles.default};
      this.scrollButtonConfig = config;
    }
    this.element = this.createElement();
    this._messages.elementRef.appendChild(this.element);
  }

  private static displayElement(element: HTMLElement) {
    element[STYLE].opacity = ONE;
    element[STYLE].pointerEvents = 'auto';
  }

  private static hideElement(element: HTMLElement) {
    element[STYLE].opacity = ZERO;
    element[STYLE].pointerEvents = 'none';
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
    ElementUtils.assignButtonEvents(element, () => {
      const smoothScroll = this.isScrollButton
        ? this.scrollButtonConfig?.smoothScroll
        : this.hiddenMessagesConfig?.smoothScroll;
      const isAnimation = typeof smoothScroll === 'boolean' ? smoothScroll : true;
      if (this.isScrollButton || this.hiddenMessagesConfig?.clickScroll === 'last') {
        ElementUtils.scrollToBottom(this._messages, isAnimation);
        if (isAnimation && this.element) {
          ScrollButton.hideElement(this.element);
          this.isScrollingToBottom = true;
          ElementUtils.waitForScrollEnd(this._messages.elementRef, () => {
            this.isScrollingToBottom = false;
          });
        }
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
    });
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
      if (number === 0) {
        ScrollButton.hideElement(this.element);
        return;
      }
      const content = `${number} new message${number === 1 ? '' : 's'}`;
      if (this.hiddenMessagesConfig?.onUpdate) {
        const newContent = this.hiddenMessagesConfig.onUpdate(content, number);
        this.element.innerHTML = newContent;
        HTMLUtils.apply(this._messages, this.element);
      } else {
        this.element.innerHTML = content;
      }
      if (this.hiddenMessagesConfig?.styles) this.assignStyles(this.hiddenMessagesConfig.styles);
      ScrollButton.displayElement(this.element);
    }
  }

  public updateHidden() {
    if (this.isScrollingToBottom) return;
    if (this.hiddenMessagesConfig) {
      const lastMessageContainer = this._messages.getFirstMessageContentEl()?.outerContainer;
      if (lastMessageContainer && !ElementUtils.isVisibleInParent(lastMessageContainer, this._messages.elementRef)) {
        this.hiddenElements.add(lastMessageContainer);
        this.io?.observe(lastMessageContainer);
        this.updateHiddenElement();
      }
    } else {
      this.updateScroll();
    }
  }

  public clearHidden() {
    this.hiddenElements.forEach((element) => this.io?.unobserve(element));
    this.hiddenElements.clear();
    this.updateHiddenElement();
  }

  private displayScroll() {
    if (this.element && this.element[STYLE].opacity !== ONE) {
      ScrollButton.displayElement(this.element);
      this.element.innerHTML =
        this.scrollButtonConfig?.content || '<span style="font-size: 1.2rem; user-select: none;">&darr;</span>';
      if (this.scrollButtonConfig?.styles) this.assignStyles(this.scrollButtonConfig.styles);
    }
  }

  public updateScroll() {
    if (this.isScrollingToBottom || !this.scrollButtonConfig) return;
    if (ElementUtils.isScrollbarAtBottomOfElement(this._messages.elementRef, this.scrollButtonConfig?.scrollDelta || 80)) {
      if (this.element && this.element[STYLE].opacity !== ZERO) ScrollButton.hideElement(this.element);
    } else {
      this.displayScroll();
      this.isScrollButton = true;
    }
  }
}
