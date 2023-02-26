import {Messages} from './messages/messages';
import {Input} from './input/input';

// WORK - API to insert text
// WORK - emit result
// WORK - API to programmatically insert text - results to be able to continue the conversation
// WORK - add a sound when a new message arrives - if minified - show a notification bubble
export class ChatView {
  constructor(containerRef: HTMLElement, key: string) {
    const elementRef = document.createElement('div');
    elementRef.id = 'chat';
    containerRef.replaceChildren(elementRef);
    const messages = new Messages(elementRef);
    const userInput = new Input(key, messages.addNewMessage.bind(messages));
    elementRef.appendChild(userInput.elementRef);
  }
}
