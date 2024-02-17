import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {Cohere, CohereChatConfig} from '../../types/cohere';
import {CohereChatResult} from '../../types/cohereResult';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {Response} from '../../types/response';
import {DeepChat} from '../../deepChat';
import {CohereIO} from './cohereIO';

export class CohereChatIO extends CohereIO {
  constructor(deepChat: DeepChat) {
    const directConnectionCopy = JSON.parse(JSON.stringify(deepChat.directConnection));
    const config = directConnectionCopy.cohere?.chat as Cohere['chat'];
    const apiKey = directConnectionCopy.cohere;
    super(deepChat, 'https://api.cohere.ai/v1/chat', 'Ask me anything!', config, apiKey);
    if (typeof config === 'object') Object.assign(this.rawBody, config);
    this.maxMessages ??= -1;
  }

  private preprocessBody(body: CohereChatConfig, pMessages: MessageContentI[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body));
    const textMessages = pMessages.filter((message) => message.text);
    bodyCopy.query = textMessages[textMessages.length - 1].text;
    bodyCopy.chat_history = textMessages
      .slice(0, textMessages.length - 1)
      .map((message) => ({text: message.text, user_name: message.role === 'ai' ? 'CHATBOT' : 'USER'}));
    return bodyCopy;
  }

  override async callServiceAPI(messages: Messages, pMessages: MessageContentI[]) {
    if (!this.connectSettings) throw new Error('Request settings have not been set up');
    const body = this.preprocessBody(this.rawBody, pMessages);
    HTTPRequest.request(this, body, messages);
  }

  override async extractResultData(result: CohereChatResult): Promise<Response> {
    if (result.message) throw result.message;
    return {text: result.text};
  }
}
