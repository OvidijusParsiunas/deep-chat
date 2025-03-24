import {ErrorMessages} from '../../../../utils/errorMessages/errorMessages';
import {ElementUtils} from '../../../../utils/element/elementUtils';
import {MessageContentI} from '../../../../types/messagesInternal';
import {TextToSpeech} from '../textToSpeech/textToSpeech';
import {MessageFile} from '../../../../types/messageFile';
import {MessageElements, Messages} from '../messages';
import {Response} from '../../../../types/response';
import {MessageUtils} from '../utils/messageUtils';
import {HTMLMessages} from '../html/htmlMessages';
import {MessagesBase} from '../messagesBase';
import {HTMLUtils} from '../html/htmlUtils';

export class MessageStream {
  static readonly MESSAGE_CLASS = 'streamed-message';
  private _fileAdded = false;
  private _streamType: 'text' | 'html' | '' = '';
  private _elements?: MessageElements;
  private _hasStreamEnded = false;
  private _activeMessageRole?: string;
  private _message?: MessageContentI;
  private readonly _messages: MessagesBase;
  private _endStreamAfterOperation?: boolean;

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
    if (!this._elements && !this._message) {
      this.setInitialState(streamType, content, response?.role);
    } else if (this._streamType !== streamType) {
      return console.error(ErrorMessages.INVALID_STREAM_EVENT_MIX);
    } else {
      this.updateBasedOnType(content, streamType, this._elements?.bubbleElement as HTMLElement, response?.overwrite);
    }
    if (!this._messages.focusMode && isScrollbarAtBottomOfElement) ElementUtils.scrollToBottom(this._messages.elementRef);
  }

  private setInitialState(streamType: 'text' | 'html', content: string, role?: string) {
    this._streamType = streamType;
    role ??= MessageUtils.AI_ROLE;
    // does not overwrite previous message for simplicity as otherwise users would need to return first response with
    // {..., overwrite: false} and others as {..., ovewrite: true} which would be too complex on their end
    this._elements =
      streamType === 'text'
        ? this._messages.addNewTextMessage(content, role)
        : HTMLMessages.add(this._messages, content, role);
    if (this._elements) {
      this._elements.bubbleElement.classList.add(MessageStream.MESSAGE_CLASS);
      this._activeMessageRole = role;
      this._message = {role: this._activeMessageRole, [streamType]: content};
      this._messages.messageToElements.push([this._message, {[streamType]: this._elements}]);
    }
  }

  private updateBasedOnType(content: string, expectedType: string, bubbleElement: HTMLElement, isOverwrite = false) {
    MessageUtils.unfillEmptyMessageElement(bubbleElement, content);
    const func = expectedType === 'text' ? this.updateText : this.updateHTML;
    func.bind(this)(content, bubbleElement, isOverwrite);
  }

  private updateText(text: string, bubbleElement: HTMLElement, isOverwrite: boolean) {
    if (!this._message) return;
    this._message.text = isOverwrite ? text : this._message.text + text;
    this._messages.renderText(bubbleElement, this._message.text);
  }

  private updateHTML(html: string, bubbleElement: HTMLElement, isOverwrite: boolean) {
    if (!this._message) return;
    if (isOverwrite) {
      this._message.html = html;
      bubbleElement.innerHTML = html;
    } else {
      const wrapper = document.createElement('span');
      wrapper.innerHTML = html;
      bubbleElement.appendChild(wrapper);
      this._message.html = bubbleElement?.innerHTML || '';
    }
  }

  public finaliseStreamedMessage() {
    if (this._endStreamAfterOperation || !this._message) return;
    if (this._fileAdded && !this._elements) return;
    if (!this._elements) throw Error(ErrorMessages.NO_VALID_STREAM_EVENTS_SENT);
    if (!this._elements.bubbleElement?.classList.contains(MessageStream.MESSAGE_CLASS)) return;
    if (this._streamType === 'text') {
      if (this._messages.textToSpeech) TextToSpeech.speak(this._message.text || '', this._messages.textToSpeech);
    } else if (this._streamType === 'html') {
      if (this._elements) HTMLUtils.apply(this._messages, this._elements.outerContainer);
    }
    this._elements.bubbleElement.classList.remove(MessageStream.MESSAGE_CLASS);
    if (this._message) {
      this._messages.sendClientUpdate(MessagesBase.createMessageContent(this._message), false);
    }
    this._hasStreamEnded = true;
  }

  public markFileAdded() {
    this._fileAdded = true;
  }

  public newMessage() {
    this.finaliseStreamedMessage();
    this._elements = undefined;
    delete this._message;
    this._fileAdded = false;
    this._hasStreamEnded = false;
    this._activeMessageRole = undefined;
  }

  // prettier-ignore
  public async endStreamAfterFileDownloaded(
      messages: Messages, downloadCb: () => Promise<{files?: MessageFile[]; text?: string}>) {
    this._endStreamAfterOperation = true;
    const {text, files} = await downloadCb();
    if (text) this.updateBasedOnType(text, 'text', this._elements?.bubbleElement as HTMLElement, true);
    this._endStreamAfterOperation = false;
    this.finaliseStreamedMessage();
    if (files) messages.addNewMessage({files}); // adding later to trigger event later
  }
}
