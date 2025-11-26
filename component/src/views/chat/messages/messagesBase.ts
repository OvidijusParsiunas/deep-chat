import {AI, ERROR_MESSAGE_TEXT_CLASS, FILES, HTML, MESSAGES_ID, TEXT, USER} from '../../../utils/consts/messageConstants';
import {MessageElementsStyles, MessageRoleStyles, MessageStyles, UserContent} from '../../../types/messages';
import {MessageContentI, MessageToElements, Overwrite} from '../../../types/messagesInternal';
import {CLASS_LIST, CREATE_ELEMENT} from '../../../utils/consts/htmlConstants';
import {ProcessedTextToSpeechConfig} from './textToSpeech/textToSpeech';
import {ElementUtils} from '../../../utils/element/elementUtils';
import {HTMLDeepChatElements} from './html/htmlDeepChatElements';
import {LoadingStyle} from '../../../utils/loading/loadingStyle';
import {RemarkableConfig} from './remarkable/remarkableConfig';
import {BrowserStorage} from './browserStorage/browserStorage';
import {MessageStyleUtils} from './utils/messageStyleUtils';
import {FireEvents} from '../../../utils/events/fireEvents';
import {RemarkableOptions} from '../../../types/remarkable';
import {LoadingHistory} from './history/loadingHistory';
import {HTMLClassUtilities} from '../../../types/html';
import {FocusModeUtils} from './utils/focusModeUtils';
import {IntroPanel} from '../introPanel/introPanel';
import {Legacy} from '../../../utils/legacy/legacy';
import {FocusMode} from '../../../types/focusMode';
import {HTMLWrappers} from '../../../types/stream';
import {MessageUtils} from './utils/messageUtils';
import {HiddenMessages} from './hiddenMessages';
import {Response} from '../../../types/response';
import {DeepChat} from '../../../deepChat';
import {MessageElements} from './messages';
import {HTMLUtils} from './html/htmlUtils';
import {Remarkable} from 'remarkable';
import {Avatar} from './avatar';
import {Name} from './name';

export class MessagesBase {
  messageElementRefs: MessageElements[] = [];
  textToSpeech?: ProcessedTextToSpeechConfig;
  submitUserMessage?: (content: UserContent) => void;
  readonly elementRef: HTMLElement;
  readonly focusMode?: FocusMode;
  readonly messageStyles?: MessageStyles;
  readonly htmlClassUtilities: HTMLClassUtilities = {};
  readonly messageToElements: MessageToElements = [];
  readonly avatar?: Avatar;
  readonly name?: Name;
  protected _introPanel?: IntroPanel;
  private _remarkable: Remarkable;
  readonly _customWrappers?: HTMLWrappers;
  private _lastGroupMessagesElement?: HTMLElement;
  private readonly _applyHTMLToRemarkable?: boolean;
  private readonly _onMessage?: (message: MessageContentI, isHistory: boolean) => void;
  public readonly browserStorage?: BrowserStorage;
  public static readonly TEXT_BUBBLE_CLASS = 'text-message';
  public static readonly INTRO_CLASS = 'deep-chat-intro';
  public static readonly LAST_GROUP_MESSAGES_ACTIVE = 'deep-chat-last-group-messages-active';
  public readonly autoScrollAllowed: boolean = true;
  readonly hiddenMessages?: HiddenMessages;

  constructor(deepChat: DeepChat) {
    this.elementRef = MessagesBase.createContainerElement();
    this.messageStyles = Legacy.processMessageStyles(deepChat.messageStyles);
    this._remarkable = RemarkableConfig.createNew(deepChat.remarkable);
    this._applyHTMLToRemarkable = deepChat.remarkable?.applyHTML;
    if (deepChat.avatars) this.avatar = new Avatar(deepChat.avatars);
    if (deepChat.names) this.name = new Name(deepChat.names);
    if (deepChat.browserStorage) this.browserStorage = new BrowserStorage(deepChat.browserStorage);
    this._onMessage = FireEvents.onMessage.bind(this, deepChat);
    if (deepChat.htmlClassUtilities) this.htmlClassUtilities = deepChat.htmlClassUtilities;
    if (deepChat.hiddenMessages) this.hiddenMessages = new HiddenMessages(this, deepChat.hiddenMessages);
    this.focusMode = Legacy.processFocusMode(deepChat.focusMode);
    if (!this.focusMode) {
      this._lastGroupMessagesElement = CREATE_ELEMENT();
      this.elementRef.appendChild(this._lastGroupMessagesElement);
      if (deepChat.upwardsMode) this.elementRef = this._lastGroupMessagesElement;
    }
    if (typeof this.focusMode !== 'boolean' && this.focusMode?.fade) {
      FocusModeUtils.setFade(this.elementRef, this.focusMode.fade);
    }
    this._customWrappers = deepChat.htmlWrappers || Legacy.processStreamHTMLWrappers(deepChat.connect?.stream);
    if (typeof this.focusMode !== 'boolean' && this.focusMode?.streamAutoScroll === false) this.autoScrollAllowed = false;
    setTimeout(() => {
      this.submitUserMessage = deepChat.submitUserMessage; // wait for it to be available in input.ts
    });
  }

  private static createContainerElement() {
    const container = CREATE_ELEMENT();
    container.id = MESSAGES_ID;
    return container;
  }

  public addNewTextMessage(text: string, role: string, overwrite?: Overwrite, isTop = false) {
    if (overwrite?.status) {
      const overwrittenElements = this.overwriteText(role, text, this.messageElementRefs);
      if (overwrittenElements) return overwrittenElements;
      overwrite.status = false;
    }
    const messageElements = isTop
      ? this.createAndPrependNewMessageElement(text, role, isTop)
      : this.createAndAppendNewMessageElement(text, role);
    messageElements.bubbleElement[CLASS_LIST].add(MessagesBase.TEXT_BUBBLE_CLASS);
    this.applyCustomStyles(messageElements, role, false);
    MessageUtils.fillEmptyMessageElement(messageElements.bubbleElement, text);
    return messageElements;
  }

  // prettier-ignore
  private overwriteText(role: string, text: string, elementRefs: MessageElements[]) {
    const elems = MessageUtils.overwriteMessage(
      this.messageToElements, elementRefs, text, role, 'text', MessagesBase.TEXT_BUBBLE_CLASS);
    if (elems) this.renderText(elems.bubbleElement, text, role);
    return elems;
  }

  protected createAndAppendNewMessageElement(text: string, role: string) {
    const messageElements = this.createNewMessageElement(text, role);
    this.appendOuterContainerElemet(messageElements.outerContainer, this.focusMode ? role : undefined);
    return messageElements;
  }

  private createNewGroupElementFocusMode() {
    this._lastGroupMessagesElement?.[CLASS_LIST].remove(MessagesBase.LAST_GROUP_MESSAGES_ACTIVE);
    const lastGroupMessageElement = CREATE_ELEMENT();
    // first group should not have height 100% to not create a partial chat scroll bar
    if (
      this.messageToElements.length > 1 ||
      (this.messageToElements.length === 1 && this.messageToElements[0][0].role !== USER)
    ) {
      lastGroupMessageElement[CLASS_LIST].add(MessagesBase.LAST_GROUP_MESSAGES_ACTIVE);
    }
    this._lastGroupMessagesElement = lastGroupMessageElement;
  }

  public appendOuterContainerElemet(outerContainer: HTMLElement, role?: string) {
    if (this.focusMode && (role === USER || !this._lastGroupMessagesElement)) this.createNewGroupElementFocusMode();
    this._lastGroupMessagesElement?.appendChild(outerContainer);
    if (this._lastGroupMessagesElement && (this.focusMode || !this.elementRef.contains(this._lastGroupMessagesElement))) {
      this.elementRef.appendChild(this._lastGroupMessagesElement);
    }
  }

  private createAndPrependNewMessageElement(text: string, role: string, isTop: boolean, loading = false) {
    const messageElements = this.createNewMessageElement(text, role, isTop, loading);
    if (isTop && (this.elementRef.firstChild as HTMLElement)?.[CLASS_LIST].contains(MessagesBase.INTRO_CLASS)) {
      (this.elementRef.firstChild as HTMLElement).insertAdjacentElement('afterend', messageElements.outerContainer);
      // swapping to place intro refs into correct position
      const introRefs = this.messageElementRefs[0];
      this.messageElementRefs[0] = this.messageElementRefs[1];
      this.messageElementRefs[1] = introRefs;
    } else {
      this.elementRef.insertBefore(messageElements.outerContainer, this.elementRef.firstChild);
    }
    return messageElements;
  }

  public createMessageElementsOnOrientation(text: string, role: string, isTop: boolean, loading = false) {
    return isTop
      ? this.createAndPrependNewMessageElement(text, role, isTop, loading)
      : this.createNewMessageElement(text, role, isTop, loading);
  }

  public createNewMessageElement(text: string, role: string, isTop = false, loading = false) {
    if (!loading) this._introPanel?.hide();
    const lastMessageElements = this.messageElementRefs[this.messageElementRefs.length - 1];
    LoadingHistory.changeFullViewToSmall(this);
    if (!isTop && MessagesBase.isTemporaryElement(lastMessageElements)) {
      this.revealRoleElementsIfTempRemoved(lastMessageElements, role); // readding role elements to previous message
      this.removeLastMessage();
    }
    return this.createMessageElements(text, role, isTop);
  }

  // this can be tested by having an ai message, then a temp ai message with html that submits new user message:
  // https://github.com/OvidijusParsiunas/deep-chat/issues/258
  // prettier-ignore
  private revealRoleElementsIfTempRemoved(tempElements: MessageElements, newRole: string) {
    if ((!!this.avatar || !!this.name) && HTMLDeepChatElements.isElementTemporary(tempElements)) {
      // if prev message before temp has a different role to the new one, make sure its avatar is revealed
      const prevMessageElements = this.messageElementRefs[this.messageElementRefs.length - 2];
      if (prevMessageElements && this.messageToElements.length > 0
          && !tempElements.bubbleElement[CLASS_LIST].contains(MessageUtils.getRoleClass(newRole))) {
        MessageUtils.revealRoleElements(prevMessageElements.innerContainer, this.avatar, this.name);
      }
    }
  }

  protected static isTemporaryElement(elements: MessageElements) {
    return MessagesBase.isLoadingMessage(elements) || HTMLDeepChatElements.isElementTemporary(elements);
  }

  public createElements(text: string, role: string) {
    const messageElements = MessagesBase.createBaseElements(role);
    const {outerContainer, innerContainer, bubbleElement} = messageElements;
    outerContainer.appendChild(innerContainer);
    this.addInnerContainerElements(bubbleElement, text, role);
    return messageElements;
  }

  public createMessageElements(text: string, role: string, isTop = false) {
    const messageElements = this.createElements(text, role);
    MessageUtils.updateRefArr(this.messageElementRefs, messageElements, isTop);
    MessageUtils.classifyRoleMessages(this.messageElementRefs, role);
    return messageElements;
  }

  protected static createBaseElements(role: string): MessageElements {
    const outerContainer = CREATE_ELEMENT();
    const innerContainer = CREATE_ELEMENT();
    innerContainer[CLASS_LIST].add('inner-message-container');
    outerContainer.appendChild(innerContainer);
    outerContainer[CLASS_LIST].add('outer-message-container');
    outerContainer[CLASS_LIST].add(MessageUtils.buildRoleOuterContainerClass(role));
    const bubbleElement = CREATE_ELEMENT();
    bubbleElement[CLASS_LIST].add('message-bubble');
    innerContainer.appendChild(bubbleElement);
    return {outerContainer, innerContainer, bubbleElement};
  }

  // prettier-ignore
  private addInnerContainerElements(bubbleElement: HTMLElement, text: string, role: string) {
    const previousElement = this.messageElementRefs[this.messageElementRefs.length - 1];
    if (MessageUtils.areOuterContainerClassRolesSame(role, previousElement) && !this.isLastMessageError()) {
      MessageUtils.hideRoleElements(previousElement.innerContainer, this.avatar, this.name);
    }
    bubbleElement[CLASS_LIST].add('message-bubble', MessageUtils.getRoleClass(role),
      role === USER ? 'user-message-text' : 'ai-message-text');
    this.renderText(bubbleElement, text, role);
    MessageUtils.addRoleElements(bubbleElement, role, this.avatar, this.name);
    return {bubbleElement};
  }

  // prettier-ignore
  public applyCustomStyles(elements: MessageElements | undefined, role: string, media: boolean,
      otherStyles?: MessageRoleStyles | MessageElementsStyles) {
    if (elements && this.messageStyles) {
      MessageStyleUtils.applyCustomStyles(this.messageStyles, elements, role, media, otherStyles);
    }
  }

  public static createMessageContent(content: Response): MessageContentI {
    // it is important to create a new object as its properties get manipulated later on e.g. delete message.html
    const {text, files, html, custom, _sessionId, role} = content;
    const messageContent: MessageContentI = {role: role || AI};
    if (text) messageContent[TEXT] = text;
    if (files) messageContent[FILES] = files;
    if (html) messageContent[HTML] = html;
    if (!text && !files && !html) messageContent[TEXT] = '';
    if (custom) messageContent.custom = custom;
    if (_sessionId) messageContent._sessionId = _sessionId;
    return messageContent;
  }

  public removeMessage(messageElements: MessageElements) {
    messageElements.outerContainer.remove();
    const messageElementsIndex = this.messageElementRefs.findIndex((elRefs) => elRefs === messageElements);
    this.messageElementRefs.splice(messageElementsIndex, 1);
  }

  public removeLastMessage() {
    const lastMessage = this.messageElementRefs[this.messageElementRefs.length - 1];
    lastMessage.outerContainer.remove();
    this.messageElementRefs.pop();
  }

  public isLastMessageError() {
    return MessageUtils.getLastMessageBubbleElement(this.elementRef)?.[CLASS_LIST].contains(ERROR_MESSAGE_TEXT_CLASS);
  }

  public static isLoadingMessage(elements?: MessageElements) {
    return elements?.bubbleElement[CLASS_LIST].contains(LoadingStyle.BUBBLE_CLASS);
  }

  public sendClientUpdate(message: MessageContentI, isHistory = false) {
    this._onMessage?.(message, isHistory);
  }

  // role is optional to not add wrapper to error
  public renderText(bubbleElement: HTMLElement, text: string, role?: string) {
    const {contentEl: textEl, wrapper} = HTMLUtils.tryAddWrapper(bubbleElement, text, this._customWrappers, role);
    if (wrapper) HTMLUtils.apply(this, bubbleElement);
    textEl.innerHTML = this._remarkable.render(text);
    if (this._applyHTMLToRemarkable) HTMLUtils.apply(this, textEl);
    // There is a bug in remarkable where text with only numbers and full stop after them causes the creation
    // of a list which has no inner text and is instead prepended as a prefix in the start attribute (12.)
    // We also check if the only child is not <p> because it could be an image
    // https://github.com/OvidijusParsiunas/deep-chat/issues/435
    if (textEl.innerText.trim().length === 0 && textEl.children.length > 0 && textEl.children[0].tagName !== 'P') {
      textEl.innerText = text;
    }
  }

  // this is mostly used for enabling highlight.js to highlight code if it downloads later
  protected refreshTextMessages(customConfig?: RemarkableOptions) {
    this._remarkable = RemarkableConfig.createNew(customConfig);
    this.messageToElements.forEach((msgToEls) => {
      if (msgToEls[1][TEXT] && msgToEls[0][TEXT]) {
        this.renderText(msgToEls[1][TEXT].bubbleElement, msgToEls[0][TEXT], msgToEls[0].role);
      }
    });
  }

  public getFirstMessageContentEl() {
    const {text, html, files} = this.messageToElements[this.messageToElements.length - 1][1];
    return text || html || files?.[0];
  }

  public scrollToFirstElement(role: string, isScrollAtBottom: boolean) {
    if (role === USER) {
      const isAnimation = typeof this.focusMode !== 'boolean' && this.focusMode?.smoothScroll;
      ElementUtils.scrollToBottom(this, isAnimation);
    } else if (isScrollAtBottom && this.autoScrollAllowed) {
      const firstContentElement = this.getFirstMessageContentEl();
      ElementUtils.scrollToBottom(this, false, firstContentElement?.outerContainer);
    }
  }
}
