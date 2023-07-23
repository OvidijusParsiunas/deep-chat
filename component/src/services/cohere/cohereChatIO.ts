import {Messages} from '../../views/chat/messages/messages';
import {Cohere, CohereChatConfig} from '../../types/cohere';
import {CohereChatResult} from '../../types/cohereResult';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {MessageContent} from '../../types/messages';
import {CompletionsHandlers} from '../serviceIO';
import {Result} from '../../types/result';
import {DeepChat} from '../../deepChat';
import {CohereIO} from './cohereIO';

export class CohereChatIO extends CohereIO {
  private readonly username: string = 'USER';

  constructor(deepChat: DeepChat) {
    const config = deepChat.directConnection?.cohere?.chat as Cohere['chat'];
    const apiKey = deepChat.directConnection?.cohere;
    super(deepChat, 'https://api.cohere.ai/v1/chat', 'Ask me anything!', config, apiKey);
    if (typeof config === 'object') {
      if (config.user_name) this.username = config.user_name;
      this.cleanConfig(config);
      Object.assign(this.rawBody, config);
    }
    if (this.maxMessages === undefined) this.maxMessages = -1;
  }

  private cleanConfig(config: CohereChatConfig) {
    delete config.user_name;
  }

  private preprocessBody(body: CohereChatConfig, pMessages: MessageContent[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body));
    bodyCopy.query = pMessages[pMessages.length - 1].text;
    bodyCopy.chat_history = pMessages
      .slice(0, pMessages.length - 1)
      .map((message) => ({text: message.text, user_name: message.role === 'ai' ? 'CHATBOT' : this.username}));
    return bodyCopy;
  }

  override callServiceAPI(messages: Messages, pMessages: MessageContent[], completionsHandlers: CompletionsHandlers) {
    if (!this.requestSettings) throw new Error('Request settings have not been set up');
    const body = this.preprocessBody(this.rawBody, pMessages);
    HTTPRequest.request(this, body, messages, completionsHandlers.onFinish);
  }

  override async extractResultData(result: CohereChatResult): Promise<Result> {
    if (result.message) throw result.message;
    return {text: result.text};
  }
}
