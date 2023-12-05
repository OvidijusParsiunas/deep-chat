import {ErrorMessages} from '../../../../utils/errorMessages/errorMessages';
import {ElementUtils} from '../../../../utils/element/elementUtils';
import {MessageContentI} from '../../../../types/messagesInternal';
import {TextToSpeech} from '../textToSpeech/textToSpeech';
import {Response} from '../../../../types/response';
import {HTMLMessages} from '../html/htmlMessages';
import {MessageUtils} from '../messageUtils';
import {MessagesBase} from '../messagesBase';
import {HTMLUtils} from '../html/htmlUtils';
import {MessageElements} from '../messages';

export class MessageStream {
  static readonly MESSAGE_CLASS = 'streamed-message';
  private _streamedContent = '';
  private _streamType: 'text' | 'html' | '' = '';
  private _elements?: MessageElements;
  private _hasStreamEnded = false;
  private _activeMessageRole?: string;
  private readonly _messages: MessagesBase;
  private static readonly HTML_CONTENT_PLACEHOLDER = 'htmlplaceholder'; // used for extracting at end and for isStreaming

  constructor(messages: MessagesBase) {
    this._messages = messages;
  }

  public upsertStreamedMessage(response?: Response) {
    if (this._hasStreamEnded) return;
    if (response?.text === undefined && response?.html === undefined) {
      return console.error(ErrorMessages.INVALID_STREAM_EVENT);
    }
    const content = response?.text || response?.html || '';
    const isScrollbarAtBottomOfElement = ElementUtils.isScrollbarAtBottomOfElement(this._messages.elementRef);
    const streamType = response?.text !== undefined ? 'text' : 'html';
    if (!this._elements && this._streamedContent === '') {
      this.setInitialState(streamType, content, response?.role);
    } else if (this._streamType !== streamType) {
      return console.error(ErrorMessages.INVALID_STREAM_EVENT_MIX);
    } else {
      this.updateBasedOnType(content, streamType, this._elements?.bubbleElement as HTMLElement, response?.overwrite);
    }
    if (isScrollbarAtBottomOfElement) ElementUtils.scrollToBottom(this._messages.elementRef);
  }

  private setInitialState(streamType: 'text' | 'html', content: string, role?: string) {
    this._streamType = streamType;
    role ??= MessageUtils.AI_ROLE;
    // does not overwrite previous message for simplicity as otherwise users would need to return first response with
    // {..., overwrite: false} and others as {..., ovewrite: true} which would be too complex on their end
    this._elements =
      streamType === 'text'
        ? this._messages.addNewTextMessage(content, role)
        : HTMLMessages.add(this._messages, content, role, this._messages.messageElementRefs);
    this._elements.bubbleElement.classList.add(MessageStream.MESSAGE_CLASS);
    this._streamedContent = content;
    this._activeMessageRole = role;
  }

  private updateBasedOnType(content: string, expectedType: string, bubbleElement: HTMLElement, isOverwrite = false) {
    MessageUtils.unfillEmptyMessageElement(bubbleElement, content);
    const func = expectedType === 'text' ? this.updateText : this.updateHTML;
    func.bind(this)(content, bubbleElement, isOverwrite);
  }

  private updateText(text: string, bubbleElement: HTMLElement, isOverwrite: boolean) {
    this._streamedContent = isOverwrite ? text : this._streamedContent + text;
    this._messages.textElementsToText[this._messages.textElementsToText.length - 1][1] = this._streamedContent;
    this._messages.renderText(bubbleElement, this._streamedContent);
  }

  private updateHTML(html: string, bubbleElement: HTMLElement, isOverwrite: boolean) {
    if (isOverwrite) {
      this._streamedContent = html;
      bubbleElement.innerHTML = html;
    } else {
      const wrapper = document.createElement('span');
      wrapper.innerHTML = html;
      bubbleElement.appendChild(wrapper);
      this._streamedContent = MessageStream.HTML_CONTENT_PLACEHOLDER;
    }
  }

  public finaliseStreamedMessage() {
    const {textElementsToText, elementRef} = this._messages;
    const lastMessageBubbleElClasses = MessageUtils.getLastMessageBubbleElement(elementRef)?.classList;
    if (lastMessageBubbleElClasses?.contains('loading-message-text'))
      throw Error(ErrorMessages.NO_VALID_STREAM_EVENTS_SENT);
    if (!lastMessageBubbleElClasses?.contains(MessageStream.MESSAGE_CLASS)) return;
    const newMessage: MessageContentI = {role: this._activeMessageRole || MessageUtils.AI_ROLE};
    if (this._streamType === 'text') {
      textElementsToText[textElementsToText.length - 1][1] = this._streamedContent;
      newMessage.text = this._streamedContent;
      if (this._messages.textToSpeech) TextToSpeech.speak(this._streamedContent, this._messages.textToSpeech);
    } else if (this._streamType === 'html') {
      if (this._streamedContent === MessageStream.HTML_CONTENT_PLACEHOLDER) {
        this._streamedContent = MessageUtils.getLastMessageBubbleElement(elementRef)?.innerHTML || '';
      }
      if (this._elements) HTMLUtils.apply(this._messages, this._elements.outerContainer);
      newMessage.html = this._streamedContent;
    }
    if (newMessage) {
      this._messages.messages.push(newMessage);
      this._messages.sendClientUpdate(MessagesBase.createMessageContent(newMessage), false);
    }
    this._hasStreamEnded = true;
  }
}
