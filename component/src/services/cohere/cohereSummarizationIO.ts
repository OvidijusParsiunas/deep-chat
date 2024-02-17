import {Cohere, CohereSummarizationConfig} from '../../types/cohere';
import {CohereSummarizationResult} from '../../types/cohereResult';
import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {Response} from '../../types/response';
import {DeepChat} from '../../deepChat';
import {CohereIO} from './cohereIO';

export class CohereSummarizationIO extends CohereIO {
  constructor(deepChat: DeepChat) {
    const config = deepChat.directConnection?.cohere?.summarization as Cohere['summarization'];
    const apiKey = deepChat.directConnection?.cohere;
    super(deepChat, 'https://api.cohere.ai/v1/summarize', 'Insert text to summarize', config, apiKey);
  }

  preprocessBody(body: CohereSummarizationConfig, messages: MessageContentI[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body));
    const mostRecentMessageText = messages[messages.length - 1].text;
    if (!mostRecentMessageText) return;
    return {text: mostRecentMessageText, ...bodyCopy};
  }

  override async callServiceAPI(messages: Messages, pMessages: MessageContentI[]) {
    if (!this.connectSettings) throw new Error('Request settings have not been set up');
    const body = this.preprocessBody(this.rawBody, pMessages);
    HTTPRequest.request(this, body, messages);
  }

  override async extractResultData(result: CohereSummarizationResult): Promise<Response> {
    if (result.message) throw result.message;
    return {text: result.summary || ''};
  }
}
