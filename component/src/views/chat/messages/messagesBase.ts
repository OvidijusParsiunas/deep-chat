import {MessageElementsStyles, MessageRoleStyles, MessageStyles, UserContent} from '../../../types/messages';
import {MessageContentI, MessageToElements, Overwrite} from '../../../types/messagesInternal';
import {ProcessedTextToSpeechConfig} from './textToSpeech/textToSpeech';
import {ElementUtils} from '../../../utils/element/elementUtils';
import {HTMLDeepChatElements} from './html/htmlDeepChatElements';
import {LoadingStyle} from '../../../utils/loading/loadingStyle';
import {RemarkableConfig} from './remarkable/remarkableConfig';
import {MessageStyleUtils} from './utils/messageStyleUtils';
import {FireEvents} from '../../../utils/events/fireEvents';
import {RemarkableOptions} from '../../../types/remarkable';
import {LoadingHistory} from './history/loadingHistory';
import {HTMLClassUtilities} from '../../../types/html';
import {FocusModeUtils} from './utils/focusModeUtils';
import {IntroPanel} from '../introPanel/introPanel';
import {Legacy} from '../../../utils/legacy/legacy';
import {FocusMode} from '../../../types/focusMode';
import {MessageUtils} from './utils/messageUtils';
import {Response} from '../../../types/response';
import {DeepChat} from '../../../deepChat';
import {MessageElements} from './messages';
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
  private _lastGroupMessagesElement?: HTMLElement;
  private readonly _onMessage?: (message: MessageContentI, isHistory: boolean) => void;
  public static readonly TEXT_BUBBLE_CLASS = 'text-message';
  public static readonly INTRO_CLASS = 'deep-chat-intro';
  public static readonly LAST_GROUP_MESSAGES_ACTIVE = 'deep-chat-last-group-messages-active';

  constructor(deepChat: DeepChat) {
    this.elementRef = MessagesBase.createContainerElement();
    this.messageStyles = Legacy.processMessageStyles(deepChat.messageStyles);
    this._remarkable = RemarkableConfig.createNew(deepChat.remarkable);
    if (deepChat.avatars) this.avatar = new Avatar(deepChat.avatars);
    if (deepChat.names) this.name = new Name(deepChat.names);
    this._onMessage = FireEvents.onMessage.bind(this, deepChat);
    if (deepChat.htmlClassUtilities) this.htmlClassUtilities = deepChat.htmlClassUtilities;
    this.focusMode = deepChat.focusMode;
    if (!this.focusMode) this._lastGroupMessagesElement = document.createElement('div');
    if (typeof this.focusMode !== 'boolean' && this.focusMode?.fade) {
      FocusModeUtils.setFade(this.elementRef, this.focusMode.fade);
    }
    setTimeout(() => {
      this.submitUserMessage = deepChat.submitUserMessage; // wait for it to be available in input.ts
    });
  }

  private static createContainerElement() {
    const container = document.createElement('div');
    container.id = 'messages';
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
    messageElements.bubbleElement.classList.add(MessagesBase.TEXT_BUBBLE_CLASS);
    this.applyCustomStyles(messageElements, role, false);
    MessageUtils.fillEmptyMessageElement(messageElements.bubbleElement, text);
    return messageElements;
  }

  // prettier-ignore
  private overwriteText(role: string, text: string, elementRefs: MessageElements[]) {
    const elems = MessageUtils.overwriteMessage(
      this.messageToElements, elementRefs, text, role, 'text', MessagesBase.TEXT_BUBBLE_CLASS);
    if (elems) this.renderText(elems.bubbleElement, text);
    return elems;
  }

  protected createAndAppendNewMessageElement(text: string, role: string) {
    if (this.focusMode) {
      return this.appendNewMessageElementFocusMode(text, role);
    }
    return this.createAndAppendNewMessageElementDefault(text, role);
  }

  private appendNewMessageElementFocusMode(text: string, role: string) {
    const messageElements = this.createNewMessageElement(text, role);
    this.appendOuterContainerElemet(messageElements.outerContainer, role);
    if (role === 'user') {
      const isAnimation = typeof this.focusMode !== 'boolean' && this.focusMode?.isScroll;
      // timeout neeed when bubble font is large
      setTimeout(() => ElementUtils.scrollToBottom(this.elementRef, isAnimation));
    } else {
      // prevents a browser bug where a long response from AI would sometimes scroll down
      this.messageElementRefs[this.messageElementRefs.length - 2]?.outerContainer.scrollIntoView();
    }
    return messageElements;
  }

  private createNewGroupElementFocusMode() {
    this._lastGroupMessagesElement?.classList.remove(MessagesBase.LAST_GROUP_MESSAGES_ACTIVE);
    const lastGroupMessageElement = document.createElement('div');
    // first group should not have height 100% to not create a partial chat scroll bar
    if (this._lastGroupMessagesElement) lastGroupMessageElement.classList.add(MessagesBase.LAST_GROUP_MESSAGES_ACTIVE);
    this._lastGroupMessagesElement = lastGroupMessageElement;
  }

  private createAndAppendNewMessageElementDefault(text: string, role: string) {
    const messageElements = this.createNewMessageElement(text, role);
    this.appendOuterContainerElemet(messageElements.outerContainer);
    setTimeout(() => ElementUtils.scrollToBottom(this.elementRef)); // timeout neeed when bubble font is large
    return messageElements;
  }

  public appendOuterContainerElemet(outerContainer: HTMLElement, role?: string) {
    if (this.focusMode && (role === 'user' || !this._lastGroupMessagesElement)) this.createNewGroupElementFocusMode();
    this._lastGroupMessagesElement?.appendChild(outerContainer);
    this.elementRef.appendChild(this._lastGroupMessagesElement as HTMLElement);
  }

  private createAndPrependNewMessageElement(text: string, role: string, isTop: boolean, loading = false) {
    const messageElements = this.createNewMessageElement(text, role, isTop, loading);
    if (isTop && (this.elementRef.firstChild as HTMLElement)?.classList.contains(MessagesBase.INTRO_CLASS)) {
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
      ? this.createAndPrependNewMessageElement(text, role, true, loading)
      : this.createNewMessageElement(text, role, loading);
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
          && !tempElements.bubbleElement.classList.contains(MessageUtils.getRoleClass(newRole))) {
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
    const outerContainer = document.createElement('div');
    const innerContainer = document.createElement('div');
    innerContainer.classList.add('inner-message-container');
    outerContainer.appendChild(innerContainer);
    outerContainer.classList.add('outer-message-container');
    outerContainer.classList.add(MessageUtils.buildRoleOuterContainerClass(role));
    const bubbleElement = document.createElement('div');
    bubbleElement.classList.add('message-bubble');
    innerContainer.appendChild(bubbleElement);
    return {outerContainer, innerContainer, bubbleElement};
  }

  // prettier-ignore
  private addInnerContainerElements(bubbleElement: HTMLElement, text: string, role: string) {
    const previousElement = this.messageElementRefs[this.messageElementRefs.length - 1];
    if (MessageUtils.areOuterContainerClassRolesSame(role, previousElement) && !this.isLastMessageError()) {
      MessageUtils.hideRoleElements(previousElement.innerContainer, this.avatar, this.name);
    }
    bubbleElement.classList.add('message-bubble', MessageUtils.getRoleClass(role),
      role === MessageUtils.USER_ROLE ? 'user-message-text' : 'ai-message-text');
    this.renderText(bubbleElement, text);
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
    const messageContent: MessageContentI = {role: role || MessageUtils.AI_ROLE};
    if (text) messageContent.text = text;
    if (files) messageContent.files = files;
    if (html) messageContent.html = html;
    if (!text && !files && !html) messageContent.text = '';
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
    return MessageUtils.getLastMessageBubbleElement(this.elementRef)?.classList.contains(
      MessageUtils.ERROR_MESSAGE_TEXT_CLASS
    );
  }

  public static isLoadingMessage(elements?: MessageElements) {
    return elements?.bubbleElement.classList.contains(LoadingStyle.BUBBLE_CLASS);
  }

  public sendClientUpdate(message: MessageContentI, isHistory = false) {
    this._onMessage?.(message, isHistory);
  }

  public renderText(bubbleElement: HTMLElement, text: string) {
    bubbleElement.innerHTML = this._remarkable.render(text);
    // there is a bug in remarkable where text with only numbers and full stop after them causes the creation
    // of a list which has no innert text and is instead prepended as a prefix in the start attribute (12.)
    if (bubbleElement.innerText.trim().length === 0) bubbleElement.innerText = text;
  }

  // this is mostly used for enabling highlight.js to highlight code if it downloads later
  protected refreshTextMessages(customConfig?: RemarkableOptions) {
    this._remarkable = RemarkableConfig.createNew(customConfig);
    this.messageToElements.forEach((msgToEls) => {
      if (msgToEls[1].text && msgToEls[0].text) this.renderText(msgToEls[1].text.bubbleElement, msgToEls[0].text);
    });
  }
}
