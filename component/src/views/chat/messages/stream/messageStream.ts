import {ErrorMessages} from '../../../../utils/errorMessages/errorMessages';
import {ElementUtils} from '../../../../utils/element/elementUtils';
import {TextToSpeech} from '../textToSpeech/textToSpeech';
import {Response} from '../../../../types/response';
import {HTMLMessages} from '../html/htmlMessages';
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

  // important to keep track of bubbleElement reference as multiple messages can be simulated at once in websockets
  public updatedStreamedMessage(bubbleElement?: HTMLElement, response?: Response) {
    const content = response?.text || response?.html;
    if (!content) return console.error(ErrorMessages.INVALID_STREAM_RESPONSE) as undefined;
    const isScrollbarAtBottomOfElement = ElementUtils.isScrollbarAtBottomOfElement(this.elementRef);
    const streamType = response.text ? 'text' : 'html';
    if (!bubbleElement && this._streamedContent === '') {
      bubbleElement = this.updateInitialState(streamType, content, response?.role);
    } else if (this._streamType !== streamType) {
      return console.error(ErrorMessages.INVALID_STREAM_MIX_RESPONSE) as undefined;
    }
    this.updateBasedOnType(content, streamType, bubbleElement as HTMLElement, response.overwrite);
    if (isScrollbarAtBottomOfElement) ElementUtils.scrollToBottom(this.elementRef);
    return bubbleElement;
  }

  private updateInitialState(streamType: 'text' | 'html', content: string, role?: string) {
    this._streamType = streamType;
    role ??= MessageUtils.AI_ROLE;
    // does not overwrite previous message for simplicity as otherwise users would need to return first response with
    // {..., overwrite: false} and others as {..., ovewrite: true} which would be too complex on their end
    const bubbleElement =
      streamType === 'text'
        ? this.addNewTextMessage(content, role).bubbleElement
        : HTMLMessages.add(this, content, role, this._messageElementRefs).bubbleElement;
    return bubbleElement;
  }

  private updateBasedOnType(content: string, expectedType: string, bubbleElement: HTMLElement, isOverwrite = false) {
    const func = expectedType === 'text' ? this.updateText : this.updateHTML;
    func.bind(this)(content, bubbleElement, isOverwrite);
  }

  private updateText(text: string, bubbleElement: HTMLElement, isOverwrite: boolean) {
    this._streamedContent = isOverwrite ? text : this._streamedContent + text;
    this._textElementsToText[this._textElementsToText.length - 1][1] = this._streamedContent;
    this.renderText(bubbleElement, this._streamedContent);
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
