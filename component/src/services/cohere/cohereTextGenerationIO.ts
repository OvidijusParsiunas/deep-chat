import {CohereCompletionsResult} from '../../types/cohereResult';
import {Cohere, CohereGenerateConfig} from '../../types/cohere';
import {Messages} from '../../views/chat/messages/messages';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {MessageContent} from '../../types/messages';
import {Result} from '../../types/result';
import {DeepChat} from '../../deepChat';
import {CohereIO} from './cohereIO';

export class CohereTextGenerationIO extends CohereIO {
  constructor(deepChat: DeepChat) {
    // config can be undefined as this is the default service
    const config = deepChat.directConnection?.cohere?.textGeneration as Cohere['textGeneration'];
    const apiKey = deepChat.directConnection?.cohere;
    super(deepChat, 'https://api.cohere.ai/v1/generate', 'Once upon a time', config, apiKey);
  }

  preprocessBody(body: CohereGenerateConfig, messages: MessageContent[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body));
    const mostRecentMessageText = messages[messages.length - 1].text;
    if (!mostRecentMessageText) return;
    return {prompt: mostRecentMessageText, ...bodyCopy};
  }

  override callServiceAPI(messages: Messages, pMessages: MessageContent[]) {
    if (!this.requestSettings) throw new Error('Request settings have not been set up');
    const body = this.preprocessBody(this.rawBody, pMessages);
    HTTPRequest.request(this, body, messages);
  }

  override async extractResultData(result: CohereCompletionsResult): Promise<Result> {
    if (result.message) throw result.message;
    return {text: result.generations?.[0].text || ''};
  }
}
