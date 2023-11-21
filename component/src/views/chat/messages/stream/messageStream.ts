import {ErrorMessages} from '../../../../utils/errorMessages/errorMessages';
import {ElementUtils} from '../../../../utils/element/elementUtils';
import {TextToSpeech} from '../textToSpeech/textToSpeech';
import {Response} from '../../../../types/response';
import {DeepChat} from '../../../../deepChat';
import {MessageUtils} from '../messageUtils';
import {MessageBase} from './messagesBase';

export class MessageStream extends MessageBase {
  private _streamedContent = '';
  private _streamType: 'text' | 'html' | '' = '';
  protected static readonly MESSAGE_CLASS = 'streamed-message';
  private static readonly HTML_CONTENT_PLACEHOLDER = 'htmlplaceholder'; // used for extracting at end and for isStreaming

  constructor(deepChat: DeepChat) {
    super(deepChat);
  }

  public isStreaming() {
    return !!this._streamedContent;
  }

  public addNewStreamedMessage(role?: string) {
    const {bubbleElement} = this.addNewTextMessage('', role || MessageUtils.AI_ROLE);
    const messageContent = MessageBase.createMessageContent({text: ''});
    this.messages.push(messageContent);
    bubbleElement.classList.add(MessageStream.MESSAGE_CLASS);
    ElementUtils.scrollToBottom(this.elementRef); // need to scroll down completely
  }

  public updatedStreamedMessage(response: Response, isIncrement = true) {
    const content = response.text || response.html;
    if (!content) return console.error(ErrorMessages.INVALID_STREAM_RESPONSE);
    const isScrollbarAtBottomOfElement = ElementUtils.isScrollbarAtBottomOfElement(this.elementRef);
    const {bubbleElement} = this._messageElementRefs[this._messageElementRefs.length - 1];
    // WORK - optimize
    if (content.trim().length > 0) {
      const defaultColor = this.messageStyles?.default;
      bubbleElement.style.color = defaultColor?.ai?.bubble?.color || defaultColor?.shared?.bubble?.color || '';
    }
    this.updateBasedOnType(content, !!response.text, bubbleElement, isIncrement);
    if (isScrollbarAtBottomOfElement) ElementUtils.scrollToBottom(this.elementRef);
  }

  private updateBasedOnType(content: string, isText: boolean, bubbleElement: HTMLElement, isIncrement: boolean) {
    const expectedType = isText ? 'text' : 'html';
    const func = isText ? this.updateText : this.updateHTML;
    if (this._streamType === '') {
      this._streamType = expectedType;
    } else if (this._streamType !== expectedType) {
      return console.error(ErrorMessages.INVALID_STREAM_MIX_RESPONSE);
    }
    func.bind(this)(content, bubbleElement, isIncrement);
  }

  private updateText(text: string, bubbleElement: HTMLElement, isIncrement: boolean) {
    this._streamedContent = isIncrement ? this._streamedContent + text : text;
    this._textElementsToText[this._textElementsToText.length - 1][1] = this._streamedContent;
    bubbleElement.innerHTML = this._remarkable.render(this._streamedContent);
  }

  private updateHTML(html: string, bubbleElement: HTMLElement, isIncrement: boolean) {
    if (isIncrement) {
      if (this._streamedContent === '') bubbleElement.replaceChildren(); // remove '.'
      const wrapper = document.createElement('span');
      wrapper.innerHTML = html;
      bubbleElement.appendChild(wrapper);
      this._streamedContent = MessageStream.HTML_CONTENT_PLACEHOLDER;
    } else {
      this._streamedContent = html;
      bubbleElement.innerHTML = html;
    }
  }

  public finaliseStreamedMessage() {
    if (!this.getLastMessageBubbleElement()?.classList.contains(MessageStream.MESSAGE_CLASS)) return;
    if (this._streamType === 'text') {
      this._textElementsToText[this._textElementsToText.length - 1][1] = this._streamedContent;
      this.messages[this.messages.length - 1].text = this._streamedContent;
      if (this._textToSpeech) TextToSpeech.speak(this._streamedContent, this._textToSpeech);
    } else if (this._streamType === 'html') {
      if (this._streamedContent === MessageStream.HTML_CONTENT_PLACEHOLDER) {
        this._streamedContent = this.getLastMessageBubbleElement()?.innerHTML || '';
      }
      this.messages[this.messages.length - 1].html = this._streamedContent;
    }
    this.clearStreamState();
    this.sendClientUpdate(MessageBase.createMessageContent(this.messages[this.messages.length - 1]), false);
  }

  protected clearStreamState() {
    this._streamedContent = '';
    this._streamType = '';
  }
}
