import {HiddenMessages as HiddenMessagesT} from '../../../types/hiddenMessages';
import {CREATE_ELEMENT, STYLE} from '../../../utils/consts/htmlConstants';
import {StatefulEvents} from '../../../utils/element/statefulEvents';
import {ElementUtils} from '../../../utils/element/elementUtils';
import {DEFAULT} from '../../../utils/consts/inputConstants';
import {StyleUtils} from '../../../utils/element/styleUtils';
import {MessagesBase} from './messagesBase';
import {HTMLUtils} from './html/htmlUtils';

export class HiddenMessages {
  readonly hiddenElements = new Set<HTMLElement>();
  private readonly io: IntersectionObserver;
  private readonly element?: HTMLElement;
  private readonly config?: HiddenMessagesT;
  private readonly _messages: MessagesBase;

  constructor(messages: MessagesBase, config: true | HiddenMessagesT) {
    if (typeof config === 'object') this.config = config;
    this._messages = messages;
    this.io = this.initIntersectionObserver(this._messages.elementRef);
    this.element = this.createElement();
    this._messages.elementRef.appendChild(this.element);
  }

  private initIntersectionObserver(messagesElement: HTMLElement) {
    return new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && this.hiddenElements.has(entry.target as HTMLElement)) {
            this.hiddenElements.delete(entry.target as HTMLElement);
            this.io.unobserve(entry.target);
            this.updateElement();
          }
        });
      },
      {root: messagesElement, threshold: 0.1}
    );
  }

  private createElement() {
    const element = CREATE_ELEMENT();
    element.id = 'hidden-messages';
    element.onclick = () => {
      if (this.config?.clickScroll === 'last') {
        ElementUtils.scrollToBottom(this._messages, true);
      } else {
        const firstElement = this.hiddenElements.values().next().value;
        firstElement?.scrollIntoView({behavior: 'smooth'});
      }
    };
    HTMLUtils.apply(this._messages, element);
    Object.assign(element[STYLE], this.config?.styles?.[DEFAULT]);
    const statefulStyles = StyleUtils.processStateful(this.config?.styles || {});
    StatefulEvents.add(element, statefulStyles);
    return element;
  }

  public update() {
    const lastMessageContainer = this._messages.getFirstMessageContentEl()?.outerContainer;
    if (lastMessageContainer && !ElementUtils.isVisibleInParent(lastMessageContainer, this._messages.elementRef)) {
      this.hiddenElements.add(lastMessageContainer);
      this.io.observe(lastMessageContainer);
      this.updateElement();
    }
  }

  public clear() {
    this.hiddenElements.forEach((element) => this.io.unobserve(element));
    this.hiddenElements.clear();
    this.updateElement();
  }

  private updateElement() {
    if (this.element) {
      const number = this.hiddenElements.size;
      const content = `${number} new message${number === 1 ? '' : 's'}`;
      if (this.config?.onUpdate) {
        const newContent = this.config.onUpdate(content, number);
        this.element.innerHTML = newContent;
        HTMLUtils.apply(this._messages, this.element);
      } else {
        this.element.innerHTML = content;
      }
      this.element[STYLE].display = number ? 'flex' : 'none';
    }
  }
}
