import {UserInput} from './userInput/userInput';
import {Messages} from './messages/messages';
import style from './chatview.css?inline';

const chatView = document.createElement('template');
chatView.innerHTML = `
  <style>${style}</style>
  <div class="chat">
  </div>
`;

// WORK - API to insert text
// WORK - emit result
// WORK - API to programmatically insert text - results to be able to continue the conversation
// WORK - add a sound when a new message arrives - if minified - show a notification bubble
export class ChatView {
  constructor(containerRef: HTMLElement, key: string) {
    containerRef.replaceChildren(chatView.content.cloneNode(true));
    const chatElement = containerRef.getElementsByClassName('chat')[0] as HTMLElement;
    const messages = new Messages(chatElement);
    new UserInput(chatElement, key, messages.addNewMessage.bind(messages));
  }
}
