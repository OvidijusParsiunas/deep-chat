import { UserInput } from './userInput/userInput';
import { Messages } from './messages/messages';
const chatView = document.createElement('template');
chatView.innerHTML = `
  <div class="chat">
  </div>
`;
// API to insert text
// WORK - emit result
export class ChatView {
    constructor(containerRef, key) {
        containerRef.replaceChildren(chatView.content.cloneNode(true));
        const chatElement = containerRef.getElementsByClassName('chat')[0];
        const messages = new Messages(chatElement);
        new UserInput(chatElement, key, messages.addNewMessage.bind(messages));
    }
}
//# sourceMappingURL=chatView.js.map