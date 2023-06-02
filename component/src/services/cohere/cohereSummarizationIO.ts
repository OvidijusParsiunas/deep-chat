import {CohereSummarizationResult} from '../../types/cohereResult';
import {ServiceCallConfig} from '../../types/requestSettings';
import {CohereSummarizationConfig} from '../../types/cohere';
import {MessageContent} from '../../types/messages';
import {GenericObject} from '../../types/object';
import {AiAssistant} from '../../aiAssistant';
import {Result} from '../../types/result';
import {CohereIO} from './cohereIO';

type CohereServiceConfig = GenericObject<string> & ServiceCallConfig;

export class CohereSummarizationIO extends CohereIO {
  constructor(aiAssistant: AiAssistant) {
    const config = aiAssistant.service?.cohere?.summarization as CohereServiceConfig;
    super(aiAssistant, 'https://api.cohere.ai/v1/summarize', 'Insert text to summarize', config);
  }

  override preprocessBody(body: CohereSummarizationConfig, messages: MessageContent[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body));
    const mostRecentMessageText = messages[messages.length - 1].text;
    if (!mostRecentMessageText) return;
    return {text: mostRecentMessageText, ...bodyCopy};
  }

  async extractResultData(result: CohereSummarizationResult): Promise<Result> {
    if (result.message) throw result.message;
    return {text: result.summary || ''};
  }
}
