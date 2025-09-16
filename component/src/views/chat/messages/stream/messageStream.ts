import {ErrorMessages} from '../../../../utils/errorMessages/errorMessages';
import {ElementUtils} from '../../../../utils/element/elementUtils';
import {MessageContentI} from '../../../../types/messagesInternal';
import {TextToSpeech} from '../textToSpeech/textToSpeech';
import {MessageFile} from '../../../../types/messageFile';
import {MessageElements, Messages} from '../messages';
import {Response} from '../../../../types/response';
import {MessageUtils} from '../utils/messageUtils';
import {HTMLMessages} from '../html/htmlMessages';
import {Stream} from '../../../../types/stream';
import {MessagesBase} from '../messagesBase';
import {HTMLUtils} from '../html/htmlUtils';

export class MessageStream {
  static readonly MESSAGE_CLASS = 'streamed-message';
  private static readonly PARTIAL_RENDER_TEXT_MARK = '\n\n';
  private readonly _partialRender?: boolean;
  private readonly _messages: MessagesBase;
  private _fileAdded = false;
  private _streamType: 'text' | 'html' | '' = '';
  private _elements?: MessageElements;
  private _hasStreamEnded = false;
  private _activeMessageRole?: string;
  private _message?: MessageContentI;
  private _endStreamAfterOperation?: boolean;
  private _partialText: string = '';
  private _partialBubble?: HTMLDivElement;
  private _targetWrapper?: HTMLElement;

  constructor(messages: MessagesBase, stream?: Stream) {
    this._messages = messages;
    if (typeof stream === 'object') {
      this._partialRender = stream.partialRender;
    }
  }

  public upsertStreamedMessage(response?: Response) {
    if (this._hasStreamEnded) return;
    if (response?.text === undefined && response?.html === undefined) {
      return console.error(ErrorMessages.INVALID_STREAM_EVENT);
    }
    if (response?.custom && this._message) this._message.custom = response.custom;
    const content = response?.text || response?.html || '';
    const isScrollbarAtBottomOfElement = ElementUtils.isScrollbarAtBottomOfElement(this._messages.elementRef);
    const streamType = response?.text !== undefined ? 'text' : 'html';
    if (!this._elements && !this._message) {
      this.setInitialState(streamType, content, response?.role);
    } else if (this._streamType !== streamType) {
      return console.error(ErrorMessages.INVALID_STREAM_EVENT_MIX);
    } else {
      this.updateBasedOnType(content, streamType, response?.overwrite);
    }
    if (isScrollbarAtBottomOfElement) ElementUtils.scrollToBottom(this._messages.elementRef);
  }

  private setInitialState(streamType: 'text' | 'html', content: string, role?: string) {
    this._streamType = streamType;
    role ??= MessageUtils.AI_ROLE;
    const customWrapper = this._messages._customWrappers?.[role] || this._messages._customWrappers?.['default'];
    const initContent = customWrapper ? '' : content;
    // does not overwrite previous message for simplicity as otherwise users would need to return first response with
    // {..., overwrite: false} and others as {..., ovewrite: true} which would be too complex on their end
    this._elements =
      streamType === 'text'
        ? this._messages.addNewTextMessage(initContent, role)
        : HTMLMessages.add(this._messages, initContent, role);
    if (this._elements) {
      this._elements.bubbleElement.classList.add(MessageStream.MESSAGE_CLASS);
      this._activeMessageRole = role;
      this._message = {role: this._activeMessageRole, [streamType]: initContent};
      this._messages.messageToElements.push([this._message, {[streamType]: this._elements}]);
      if (customWrapper) this.setTargetWrapperIfNeeded(this._elements, content, this._streamType, customWrapper);
    }
  }

  // not using existing htmlUtils htmlWrappers logic to be able to stream html
  private setTargetWrapperIfNeeded(elements: MessageElements, content: string, streamType: string, customWrapper: string) {
    elements.bubbleElement.innerHTML = customWrapper;
    this._targetWrapper = HTMLUtils.getTargetWrapper(elements.bubbleElement);
    if (this._elements) HTMLUtils.apply(this._messages, this._elements.bubbleElement);
    this.updateBasedOnType(content, streamType);
  }

  private updateBasedOnType(content: string, expectedType: string, isOverwrite = false) {
    const bubbleElement = (this._targetWrapper || this._elements?.bubbleElement) as HTMLElement;
    if (!this._partialRender) MessageUtils.unfillEmptyMessageElement(bubbleElement, content);
    const func = expectedType === 'text' ? this.updateText : this.updateHTML;
    func.bind(this)(content, bubbleElement, isOverwrite);
  }

  private updateText(text: string, bubbleElement: HTMLElement, overwrite: boolean) {
    if (!this._message) return;
    this._message.text = overwrite ? text : this._message.text + text;
    if (this._partialRender && this.isNewPartialRenderParagraph(bubbleElement, overwrite)) {
      this.partialRenderNewParagraph(bubbleElement);
    }
    if (this._partialBubble) {
      this.partialRenderBubbleUpdate(text);
    } else {
      this._messages.renderText(bubbleElement, this._message.text);
    }
  }

  private isNewPartialRenderParagraph(bubbleElement: HTMLElement, isOverwrite: boolean) {
    if (isOverwrite) {
      bubbleElement.innerHTML = '';
      return true;
    }
    if (!this._partialBubble) {
      return this._message?.text && this.shouldCreateNewParagraph(this._message.text);
    }
    return this._partialText && this.shouldCreateNewParagraph(this._partialText);
  }

  private shouldCreateNewParagraph(text: string): boolean {
    const markIndex = text.indexOf(MessageStream.PARTIAL_RENDER_TEXT_MARK);
    if (markIndex === -1) return false;
    // Check if this is part of a markdown horizontal rule pattern - "a \n\n---\n\n a"
    const textAfterMark = text.substring(markIndex + MessageStream.PARTIAL_RENDER_TEXT_MARK.length);
    return !textAfterMark.startsWith('---');
  }

  private partialRenderNewParagraph(bubbleElement: HTMLElement) {
    this._partialText = '';
    this._partialBubble = document.createElement('div');
    this._partialBubble.classList.add('partial-render-message');
    bubbleElement.appendChild(this._partialBubble);
  }

  private partialRenderBubbleUpdate(text: string) {
    this._partialText += text;
    this._messages.renderText(this._partialBubble as HTMLDivElement, this._partialText);
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
      this._messages.browserStorage?.addMessages(this._messages.messageToElements.map(([msg]) => msg));
    }
    this._hasStreamEnded = true;
  }

  public markFileAdded() {
    this._fileAdded = true;
  }

  // prettier-ignore
  public async endStreamAfterFileDownloaded(
      messages: Messages, downloadCb: () => Promise<{files?: MessageFile[]; text?: string}>) {
    this._endStreamAfterOperation = true;
    const {text, files} = await downloadCb();
    if (text) this.updateBasedOnType(text, 'text', true);
    this._endStreamAfterOperation = false;
    this.finaliseStreamedMessage();
    if (files) messages.addNewMessage({files}); // adding later to trigger event later
  }
}
