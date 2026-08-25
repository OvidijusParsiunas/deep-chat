import {AI, ERROR, HTML, ROLE, TEXT} from '../../../../utils/consts/messageConstants';
import {CLASS_LIST, CREATE_ELEMENT} from '../../../../utils/consts/htmlConstants';
import {ElementUtils} from '../../../../utils/element/elementUtils';
import {MessageContentI} from '../../../../types/messagesInternal';
import {DEFAULT} from '../../../../utils/consts/inputConstants';
import {TextToSpeech} from '../textToSpeech/textToSpeech';
import {Response} from '../../../../types/response';
import {MessageUtils} from '../utils/messageUtils';
import {HTMLMessages} from '../html/htmlMessages';
import {Stream} from '../../../../types/stream';
import {MessagesBase} from '../messagesBase';
import {MessageElements} from '../messages';
import {HTMLUtils} from '../html/htmlUtils';
import {
  NO_VALID_STREAM_EVENTS_SENT,
  INVALID_STREAM_EVENT_MIX,
  INVALID_STREAM_EVENT,
} from '../../../../utils/errorMessages/errorMessages';

export class MessageStream {
  static readonly MESSAGE_CLASS = 'streamed-message';
  private static readonly PARTIAL_RENDER_MARK = '\n\n';
  private readonly _partialRender?: boolean;
  private readonly _messages: MessagesBase;
  private _fileAdded = false;
  private _streamType: 'text' | 'html' | '' = '';
  private _elements?: MessageElements;
  private _hasStreamEnded = false;
  private _activeMessageRole?: string;
  private _message?: MessageContentI;
  private _partialContent: string = '';
  private _partialBubble?: HTMLDivElement;
  private _targetWrapper?: HTMLElement;
  private _sessionId?: string;

  constructor(messages: MessagesBase, stream?: Stream) {
    this._messages = messages;
    if (typeof stream === 'object') {
      this._partialRender = stream.partialRender;
    }
  }

  public upsertStreamedMessage(response?: Response) {
    if (this._hasStreamEnded) return;
    if (response?.[TEXT] === undefined && response?.[HTML] === undefined) {
      return console[ERROR](INVALID_STREAM_EVENT);
    }
    const content = response?.[TEXT] || response?.[HTML] || '';
    const isScrollbarAtBottomOfElement = ElementUtils.isScrollbarAtBottomOfElement(this._messages.elementRef);
    const streamType = response?.[TEXT] !== undefined ? TEXT : HTML;
    if (!this._elements && !this._message) {
      this.setInitialState(streamType, content, response?.[ROLE]);
    } else if (this._streamType !== streamType) {
      return console[ERROR](INVALID_STREAM_EVENT_MIX);
    } else {
      if (response?.[ROLE] && response?.[ROLE] !== this._activeMessageRole) {
        this.finaliseStreamedMessage(false);
        this.setInitialState(streamType, content, response?.[ROLE]);
      } else {
        this.updateBasedOnType(content, streamType, response?.overwrite);
      }
    }
    if (response?._sessionId) this._sessionId = response?._sessionId;
    if (response?.custom && this._message) this._message.custom = response.custom;
    if (isScrollbarAtBottomOfElement && this._messages.autoScrollAllowed) ElementUtils.scrollToBottom(this._messages);
  }

  private setInitialState(streamType: 'text' | 'html', content: string, role?: string) {
    this._streamType = streamType;
    this._targetWrapper = undefined;
    this._fileAdded = false;
    this._partialContent = '';
    this._partialBubble = undefined;
    role ??= AI;
    const customWrapper = this._messages._customWrappers?.[role] || this._messages._customWrappers?.[DEFAULT];
    const initContent = customWrapper ? '' : content;
    // does not overwrite previous message for simplicity as otherwise users would need to return first response with
    // {..., overwrite: false} and others as {..., ovewrite: true} which would be too complex on their end
    this._elements =
      streamType === TEXT
        ? this._messages.addNewTextMessage(initContent, role)
        : HTMLMessages.add(this._messages, initContent, role);
    if (this._elements) {
      this._elements.bubbleElement[CLASS_LIST].add(MessageStream.MESSAGE_CLASS);
      this._activeMessageRole = role;
      this._message = {[ROLE]: this._activeMessageRole, [streamType]: initContent};
      this._messages.messageToElements.push([this._message, {[streamType]: this._elements}]);
      if (customWrapper) this.setTargetWrapperIfNeeded(this._elements, content, this._streamType, customWrapper);
      this._messages.scrollButton?.updateHidden();
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
    const func = expectedType === TEXT ? this.updateText : this.updateHTML;
    func.bind(this)(content, bubbleElement, isOverwrite);
  }

  private updateText(text: string, bubbleElement: HTMLElement, overwrite: boolean) {
    if (!this._message) return;
    this._message[TEXT] = overwrite ? text : this._message[TEXT] + text;
    if (this._partialRender) {
      this.updatePartialSegments(text, bubbleElement, overwrite);
    } else {
      this._messages.renderText(bubbleElement, this._message[TEXT]!);
    }
  }

  // finds the paragraph mark that a new partial bubble should be created at, ignoring marks that are
  // inside an unclosed code block or part of a markdown horizontal rule pattern - "a \n\n---\n\n a"
  // (when the mark is at the segment end - waits for more content to arrive to know it is not a rule)
  // https://github.com/OvidijusParsiunas/deep-chat/issues/500#issuecomment-4281293147
  private getPartialSplitIndex(segment: string) {
    let markIndex = segment.indexOf(MessageStream.PARTIAL_RENDER_MARK);
    while (markIndex !== -1) {
      const fences = this._streamType === TEXT ? segment.substring(0, markIndex).match(/```/g) : null;
      const isInsideCodeBlock = !!fences && fences.length % 2 === 1;
      const textAfterMark = segment.substring(markIndex + MessageStream.PARTIAL_RENDER_MARK.length);
      const isHorizontalRule = textAfterMark.startsWith('---') || '---'.startsWith(textAfterMark);
      if (!isInsideCodeBlock && !isHorizontalRule) return markIndex;
      markIndex = segment.indexOf(MessageStream.PARTIAL_RENDER_MARK, markIndex + 1);
    }
    return -1;
  }

  // the chunk must already be appended to this._message - renders the accumulated content of the current
  // segment (paragraph) and creates a new partial bubble at every paragraph mark, so content that arrives
  // in the same chunk as the mark is placed on the correct side of the split
  private updatePartialSegments(chunk: string, bubbleElement: HTMLElement, overwrite: boolean) {
    if (overwrite) {
      bubbleElement.innerHTML = '';
      this._partialBubble = undefined;
    }
    const key = this._streamType as 'text' | 'html';
    let segment = this._partialBubble ? this._partialContent + chunk : this._message?.[key] || '';
    let splitIndex = this.getPartialSplitIndex(segment);
    while (splitIndex !== -1) {
      this.renderPartialSegment(segment.substring(0, splitIndex), bubbleElement);
      this.partialRenderNewParagraph(bubbleElement);
      segment = segment.substring(splitIndex + MessageStream.PARTIAL_RENDER_MARK.length);
      splitIndex = this.getPartialSplitIndex(segment);
    }
    this.renderPartialSegment(segment, bubbleElement);
  }

  private partialRenderNewParagraph(bubbleElement: HTMLElement) {
    this._partialContent = '';
    this._partialBubble = CREATE_ELEMENT() as HTMLDivElement;
    this._partialBubble[CLASS_LIST].add('partial-render-message');
    bubbleElement.appendChild(this._partialBubble);
  }

  private renderPartialSegment(content: string, bubbleElement: HTMLElement) {
    const targetElement = this._partialBubble || bubbleElement;
    if (this._partialBubble) this._partialContent = content;
    if (this._streamType === TEXT) {
      this._messages.renderText(targetElement, content);
    } else {
      targetElement.innerHTML = content;
    }
  }

  private updateHTML(html: string, bubbleElement: HTMLElement, isOverwrite: boolean) {
    if (!this._message) return;
    this._message[HTML] = isOverwrite ? html : (this._message[HTML] || '') + html;
    if (this._partialRender) {
      this.updatePartialSegments(html, bubbleElement, isOverwrite);
    } else if (isOverwrite) {
      bubbleElement.innerHTML = html;
    } else {
      const wrapper = CREATE_ELEMENT('span');
      wrapper.innerHTML = html;
      bubbleElement.appendChild(wrapper);
    }
  }

  // asyncCallInProgress introduced specifically a case when stream closed (e.g. tool call) and making another call
  // hence don't throw NO_VALID_STREAM_EVENTS_SENT when no response elements yet
  public finaliseStreamedMessage(hasStreamEnded = true, asyncCallInProgress = false) {
    if (this._fileAdded && !this._elements) return;
    if (!this._elements && !asyncCallInProgress) throw Error(NO_VALID_STREAM_EVENTS_SENT);
    if (!this._message) return;
    if (!this._elements?.bubbleElement?.[CLASS_LIST].contains(MessageStream.MESSAGE_CLASS)) return;
    if (this._streamType === TEXT) {
      if (this._messages.textToSpeech) TextToSpeech.speak(this._message[TEXT] || '', this._messages.textToSpeech);
    } else if (this._streamType === HTML) {
      if (this._elements) HTMLUtils.apply(this._messages, this._elements.outerContainer);
    }
    this._elements.bubbleElement[CLASS_LIST].remove(MessageStream.MESSAGE_CLASS);
    if (this._message) {
      if (this._sessionId) this._message._sessionId = this._sessionId;
      this._messages.sendClientUpdate(MessagesBase.createMessageContent(this._message), false);
      this._messages.browserStorage?.addMessages(this._messages.messageToElements.map(([msg]) => msg));
    }
    this._hasStreamEnded = hasStreamEnded;
  }

  public markFileAdded() {
    this._fileAdded = true;
  }
}
