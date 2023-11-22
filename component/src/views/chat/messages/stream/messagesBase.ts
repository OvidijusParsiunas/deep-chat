import {MessageElementsStyles, MessageRoleStyles, MessageStyles, UserContent} from '../../../../types/messages';
import {ProcessedTextToSpeechConfig} from '../textToSpeech/textToSpeech';
import {ElementUtils} from '../../../../utils/element/elementUtils';
import {MessageContentI} from '../../../../types/messagesInternal';
import {HTMLDeepChatElements} from '../html/htmlDeepChatElements';
import {RemarkableConfig} from '../remarkable/remarkableConfig';
import {FireEvents} from '../../../../utils/events/fireEvents';
import {HTMLClassUtilities} from '../../../../types/html';
import {IntroPanel} from '../../introPanel/introPanel';
import {MessageStyleUtils} from '../messageStyleUtils';
import {Response} from '../../../../types/response';
import {Avatars} from '../../../../types/avatars';
import {DeepChat} from '../../../../deepChat';
import {Names} from '../../../../types/names';
import {MessageUtils} from '../messageUtils';
import {MessageElements} from '../messages';
import {Remarkable} from 'remarkable';
import {AvatarEl} from '../avatar';
import {Name} from '../name';

export class MessageBase {
  submitUserMessage?: (content: UserContent) => void;
  readonly elementRef: HTMLElement;
  readonly messageStyles?: MessageStyles;
  readonly messages: MessageContentI[] = [];
  readonly htmlClassUtilities: HTMLClassUtilities = {};
  protected _introPanel?: IntroPanel;
  protected _messageElementRefs: MessageElements[] = [];
  protected _textToSpeech?: ProcessedTextToSpeechConfig;
  private _remarkable: Remarkable;
  protected readonly _avatars?: Avatars;
  protected readonly _names?: Names;
  protected readonly _textElementsToText: [MessageElements, string][] = [];
  private readonly _onNewMessage?: (message: MessageContentI, isInitial: boolean) => void;

  constructor(deepChat: DeepChat) {
    this.elementRef = MessageBase.createContainerElement();
    this.messageStyles = deepChat.messageStyles;
    this._remarkable = RemarkableConfig.createNew();
    this._avatars = deepChat.avatars;
    this._names = deepChat.names;
    this._onNewMessage = FireEvents.onNewMessage.bind(this, deepChat);
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

  protected addNewTextMessage(text: string, role: string, overwrite = false) {
    if (overwrite) {
      const overwrittenElements = this.overwriteText(role, text, this._messageElementRefs);
      if (overwrittenElements) return overwrittenElements;
    }
    const messageElements = this.createAndAppendNewMessageElement(text, role);
    messageElements.bubbleElement.classList.add('text-message');
    this.applyCustomStyles(messageElements, role, false);
    if (text.trim().length === 0) MessageBase.fillEmptyMessageElement(messageElements.bubbleElement);
    this._textElementsToText.push([messageElements, text]);
    return messageElements;
  }

  private overwriteText(role: string, text: string, elementRefs: MessageElements[]) {
    const elements = MessageUtils.overwriteMessage(this.messages, elementRefs, text, role, 'text', 'text-message');
    if (elements) {
      this.renderText(elements.bubbleElement, text);
      const elementToText = MessageUtils.getLastTextToElement(this._textElementsToText, elements);
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

  public createNewMessageElement(text: string, role: string) {
    this._introPanel?.hide();
    const lastMessageElements = this._messageElementRefs[this._messageElementRefs.length - 1];
    if (MessageBase.isTemporaryElement(lastMessageElements)) {
      lastMessageElements.outerContainer.remove();
      this._messageElementRefs.pop();
    }
    return this.createMessageElements(text, role);
  }

  protected static isTemporaryElement(elements: MessageElements) {
    return (
      elements?.bubbleElement.classList.contains('loading-message-text') ||
      HTMLDeepChatElements.isElementTemporary(elements)
    );
  }

  protected createMessageElements(text: string, role: string) {
    const messageElements = MessageBase.createBaseElements();
    const {outerContainer, innerContainer, bubbleElement} = messageElements;
    outerContainer.appendChild(innerContainer);
    this.addInnerContainerElements(bubbleElement, text, role);
    this._messageElementRefs.push(messageElements);
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
    bubbleElement.classList.add('message-bubble', MessageUtils.getRoleClass(role),
      role === MessageUtils.USER_ROLE ? 'user-message-text' : 'ai-message-text');
    this.renderText(bubbleElement, text);
    if (this._avatars) AvatarEl.add(bubbleElement, role, this._avatars);
    if (this._names) Name.add(bubbleElement, role, this._names);
    return {bubbleElement};
  }

  // prettier-ignore
  public applyCustomStyles(elements: MessageElements | undefined, role: string, media: boolean,
      otherStyles?: MessageRoleStyles | MessageElementsStyles) {
    if (elements && this.messageStyles) {
      MessageStyleUtils.applyCustomStyles(this.messageStyles, elements, role, media, otherStyles);
    }
  }

  // makes sure the bubble has dimensions when there is no text
  public static fillEmptyMessageElement(bubbleElement: HTMLElement) {
    bubbleElement.textContent = '.';
    bubbleElement.style.color = '#00000000';
  }

  protected static createMessageContent(content: Response): MessageContentI {
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

  protected getLastMessageBubbleElement() {
    return Array.from(this.getLastMessageElement()?.children?.[0]?.children || []).find((element) => {
      return element.classList.contains('message-bubble');
    });
  }

  protected getLastMessageElement() {
    return this.elementRef.children[this.elementRef.children.length - 1];
  }

  protected sendClientUpdate(message: MessageContentI, isInitial = false) {
    this._onNewMessage?.(JSON.parse(JSON.stringify(message)), isInitial);
  }

  protected renderText(bubbleElement: HTMLElement, text: string) {
    bubbleElement.innerHTML = this._remarkable.render(text);
    // there is a bug in remarkable where text with only numbers and full stop after them causes the creation
    // of a list which has no innert text and is instead prepended as a prefix in the start attribute (12.)
    if (bubbleElement.innerText.trim().length === 0) bubbleElement.innerText = text;
  }

  // this is mostly used for enabling highlight.js to highlight code if it downloads later
  protected refreshTextMessages() {
    this._remarkable = RemarkableConfig.createNew();
    this._textElementsToText.forEach((elementToText) => {
      this.renderText(elementToText[0].bubbleElement, elementToText[1]);
    });
  }
}
