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
    return bubbleElement;
  }

  // important to have bubbleElement reference as multiple messages can be simulated at once in websockets
  public updatedStreamedMessage(bubbleElement: HTMLElement, response?: Response) {
    const content = response?.text || response?.html;
    if (!content) return console.error(ErrorMessages.INVALID_STREAM_RESPONSE);
    const isScrollbarAtBottomOfElement = ElementUtils.isScrollbarAtBottomOfElement(this.elementRef);
    if (content.trim().length > 0) {
      const defaultColor = this.messageStyles?.default;
      bubbleElement.style.color = defaultColor?.ai?.bubble?.color || defaultColor?.shared?.bubble?.color || '';
    }
    this.updateBasedOnType(content, !!response.text, bubbleElement, response.streamOverwrite);
    if (isScrollbarAtBottomOfElement) ElementUtils.scrollToBottom(this.elementRef);
  }

  private updateBasedOnType(content: string, isText: boolean, bubbleElement: HTMLElement, isOverwrite = false) {
    const expectedType = isText ? 'text' : 'html';
    const func = isText ? this.updateText : this.updateHTML;
    if (this._streamType === '') {
      this._streamType = expectedType;
    } else if (this._streamType !== expectedType) {
      return console.error(ErrorMessages.INVALID_STREAM_MIX_RESPONSE);
    }
    func.bind(this)(content, bubbleElement, isOverwrite);
  }

  private updateText(text: string, bubbleElement: HTMLElement, isOverwrite: boolean) {
    this._streamedContent = isOverwrite ? text : this._streamedContent + text;
    this._textElementsToText[this._textElementsToText.length - 1][1] = this._streamedContent;
    bubbleElement.innerHTML = this._remarkable.render(this._streamedContent);
  }

  private updateHTML(html: string, bubbleElement: HTMLElement, isOverwrite: boolean) {
    if (isOverwrite) {
      this._streamedContent = html;
      bubbleElement.innerHTML = html;
    } else {
      if (this._streamedContent === '') bubbleElement.replaceChildren(); // remove '.'
      const wrapper = document.createElement('span');
      wrapper.innerHTML = html;
      bubbleElement.appendChild(wrapper);
      this._streamedContent = MessageStream.HTML_CONTENT_PLACEHOLDER;
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
