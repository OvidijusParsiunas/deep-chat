import {CohereSummarizationResult} from '../../types/cohereResult';
import {CohereSummarizationConfig} from '../../types/cohere';
import {MessageContent} from '../../types/messages';
import {GenericObject} from '../../types/object';
import {Result} from '../../types/result';
import {DeepChat} from '../../deepChat';
import {CohereIO} from './cohereIO';

type CohereServiceConfig = GenericObject<string>;

export class CohereSummarizationIO extends CohereIO {
  constructor(deepChat: DeepChat) {
    const config = deepChat.directConnection?.cohere?.summarization as CohereServiceConfig | undefined;
    const apiKey = deepChat.directConnection?.cohere;
    super(deepChat, 'https://api.cohere.ai/v1/summarize', 'Insert text to summarize', config, apiKey);
  }

  override preprocessBody(body: CohereSummarizationConfig, messages: MessageContent[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body));
    const mostRecentMessageText = messages[messages.length - 1].text;
    if (!mostRecentMessageText) return;
    return {text: mostRecentMessageText, ...bodyCopy};
  }

  override async extractResultData(result: CohereSummarizationResult): Promise<Result> {
    if (result.message) throw result.message;
    return {text: result.summary || ''};
  }
}
