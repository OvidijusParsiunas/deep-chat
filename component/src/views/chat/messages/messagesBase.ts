import {MessageElementsStyles, MessageRoleStyles, MessageStyles, UserContent} from '../../../types/messages';
import {MessageContentI, Overwrite} from '../../../types/messagesInternal';
import {ProcessedTextToSpeechConfig} from './textToSpeech/textToSpeech';
import {ElementUtils} from '../../../utils/element/elementUtils';
import {HTMLDeepChatElements} from './html/htmlDeepChatElements';
import {LoadingStyle} from '../../../utils/loading/loadingStyle';
import {RemarkableConfig} from './remarkable/remarkableConfig';
import {FireEvents} from '../../../utils/events/fireEvents';
import {LoadingHistory} from './history/loadingHistory';
import {HTMLClassUtilities} from '../../../types/html';
import {MessageStyleUtils} from './messageStyleUtils';
import {IntroPanel} from '../introPanel/introPanel';
import {Response} from '../../../types/response';
import {Avatars} from '../../../types/avatars';
import {MessageUtils} from './messageUtils';
import {DeepChat} from '../../../deepChat';
import {Names} from '../../../types/names';
import {MessageElements} from './messages';
import {Remarkable} from 'remarkable';

export class MessagesBase {
  messageElementRefs: MessageElements[] = [];
  textToSpeech?: ProcessedTextToSpeechConfig;
  submitUserMessage?: (content: UserContent) => void;
  readonly elementRef: HTMLElement;
  readonly messageStyles?: MessageStyles;
  readonly messages: MessageContentI[] = [];
  readonly htmlClassUtilities: HTMLClassUtilities = {};
  textElementsToText: [MessageElements, string][] = [];
  protected _introPanel?: IntroPanel;
  protected readonly _avatars?: Avatars;
  protected readonly _names?: Names;
  private _remarkable: Remarkable;
  private readonly _onMessage?: (message: MessageContentI, isHistory: boolean) => void;

  constructor(deepChat: DeepChat) {
    this.elementRef = MessagesBase.createContainerElement();
    this.messageStyles = deepChat.messageStyles;
    this._remarkable = RemarkableConfig.createNew();
    this._avatars = deepChat.avatars;
    this._names = deepChat.names;
    this._onMessage = FireEvents.onMessage.bind(this, deepChat);
    if (deepChat.htmlClassUtilities) this.htmlClassUtilities = deepChat.htmlClassUtilities;
    setTimeout(() => {
      this.submitUserMessage = deepChat.submitUserMessage; // wait for it to be available
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
    messageElements.bubbleElement.classList.add('text-message');
    this.applyCustomStyles(messageElements, role, false);
    MessageUtils.fillEmptyMessageElement(messageElements.bubbleElement, text);
    const textElements: [MessageElements, string] = [messageElements, text];
    MessageUtils.updateRefArr(this.textElementsToText, textElements, isTop);
    return messageElements;
  }

  private overwriteText(role: string, text: string, elementRefs: MessageElements[]) {
    const elements = MessageUtils.overwriteMessage(this.messages, elementRefs, text, role, 'text', 'text-message');
    if (elements) {
      this.renderText(elements.bubbleElement, text);
      const elementToText = MessageUtils.getLastTextToElement(this.textElementsToText, elements);
      if (elementToText) elementToText[1] = text;
    }
    return elements;
  }

  protected createAndAppendNewMessageElement(text: string, role: string) {
    const messageElements = this.createNewMessageElement(text, role);
    this.elementRef.appendChild(messageElements.outerContainer);
    setTimeout(() => ElementUtils.scrollToBottom(this.elementRef)); // timeout neeed when bubble font is large
    return messageElements;
  }

  private createAndPrependNewMessageElement(text: string, role: string, isTop: boolean) {
    const messageElements = this.createNewMessageElement(text, role, isTop);
    if (isTop && (this.elementRef.firstChild as HTMLElement)?.classList.contains('deep-chat-intro')) {
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

  public createMessageElementsOnOrientation(text: string, role: string, isTop: boolean) {
    return isTop ? this.createAndPrependNewMessageElement(text, role, true) : this.createNewMessageElement(text, role);
  }

  public createNewMessageElement(text: string, role: string, isTop = false) {
    this._introPanel?.hide();
    const lastMessageElements = this.messageElementRefs[this.messageElementRefs.length - 1];
    LoadingHistory.changeFullViewToSmall(this, lastMessageElements);
    if (MessagesBase.isTemporaryElement(lastMessageElements)) {
      this.revealRoleElementsIfTempRemoved(lastMessageElements, role); // readding role elements to previous message
      lastMessageElements.outerContainer.remove();
      this.messageElementRefs.pop();
    }
    return this.createMessageElements(text, role, isTop);
  }

  // this can be tested by having an ai message, then a temp ai message with html that submits new user message:
  // https://github.com/OvidijusParsiunas/deep-chat/issues/258
  // prettier-ignore
  private revealRoleElementsIfTempRemoved(tempElements: MessageElements, newRole: string) {
    if ((this._avatars || this._names) && HTMLDeepChatElements.isElementTemporary(tempElements)) {
      // if prev message before temp has a different role to the new one, make sure its avatar is revealed
      const prevMessageElements = this.messageElementRefs[this.messageElementRefs.length - 2];
      if (prevMessageElements && this.messages[this.messages.length - 1]
          && !tempElements.bubbleElement.classList.contains(MessageUtils.getRoleClass(newRole))) {
        MessageUtils.revealRoleElements(prevMessageElements.innerContainer, this._avatars, this._names);
      }
    }
  }

  protected static isTemporaryElement(elements: MessageElements) {
    return MessagesBase.isLoadingMessage(elements) || HTMLDeepChatElements.isElementTemporary(elements);
  }

  public createMessageElements(text: string, role: string, isTop = false) {
    const messageElements = MessagesBase.createBaseElements();
    const {outerContainer, innerContainer, bubbleElement} = messageElements;
    outerContainer.appendChild(innerContainer);
    this.addInnerContainerElements(bubbleElement, text, role);
    MessageUtils.updateRefArr(this.messageElementRefs, messageElements, isTop);
    return messageElements;
  }

  protected static createBaseElements(): MessageElements {
    const outerContainer = document.createElement('div');
    const innerContainer = document.createElement('div');
    innerContainer.classList.add('inner-message-container');
    outerContainer.appendChild(innerContainer);
    outerContainer.classList.add('outer-message-container');
    const bubbleElement = document.createElement('div');
    bubbleElement.classList.add('message-bubble');
    innerContainer.appendChild(bubbleElement);
    return {outerContainer, innerContainer, bubbleElement};
  }

  // prettier-ignore
  private addInnerContainerElements(bubbleElement: HTMLElement, text: string, role: string) {
    if (this.messages[this.messages.length - 1]?.role === role && !this.isLastMessageError()) {
      MessageUtils.hideRoleElements(this.messageElementRefs, !!this._avatars, !!this._names);
    }
    bubbleElement.classList.add('message-bubble', MessageUtils.getRoleClass(role),
      role === MessageUtils.USER_ROLE ? 'user-message-text' : 'ai-message-text');
    this.renderText(bubbleElement, text);
    MessageUtils.addRoleElements(bubbleElement, role, this._avatars, this._names);
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
    const {text, files, html, _sessionId, role} = content;
    const messageContent: MessageContentI = {role: role || MessageUtils.AI_ROLE};
    if (text) messageContent.text = text;
    if (files) messageContent.files = files;
    if (html) messageContent.html = html;
    if (!text && !files && !html) messageContent.text = '';
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
    return MessageUtils.getLastMessageBubbleElement(this.elementRef)?.classList.contains('error-message-text');
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
  protected refreshTextMessages() {
    this._remarkable = RemarkableConfig.createNew();
    this.textElementsToText.forEach((elementToText) => {
      this.renderText(elementToText[0].bubbleElement, elementToText[1]);
    });
  }
}
