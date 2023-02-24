import {UserInput} from './userInput/userInput';
import {chatViewStyle} from './chatViewStyle';
import {Messages} from './messages/messages';

const chatView = document.createElement('template');
chatView.innerHTML = `
  ${chatViewStyle}
  <div class="chat">
  </div>
`;

// WORK - API to insert text
// WORK - emit result
export class ChatView {
  constructor(containerRef: HTMLElement, key: string) {
    containerRef.replaceChildren(chatView.content.cloneNode(true));
    const chatElement = containerRef.getElementsByClassName('chat')[0] as HTMLElement;
    const messages = new Messages(chatElement);
    new UserInput(chatElement, key, messages.addNewMessage.bind(messages));
  }
}
