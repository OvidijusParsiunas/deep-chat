import {CohereSummarizeResult} from '../../types/cohereResult';
import {ServiceCallConfig} from '../../types/requestSettings';
import {CohereSummarizeConfig} from '../../types/cohere';
import {MessageContent} from '../../types/messages';
import {GenericObject} from '../../types/object';
import {AiAssistant} from '../../aiAssistant';
import {Result} from '../../types/result';
import {CohereIO} from './cohereIO';

type CohereServiceConfig = true | (GenericObject<string> & ServiceCallConfig);

export class CohereSummarizeIO extends CohereIO {
  constructor(aiAssistant: AiAssistant, key?: string) {
    const config = aiAssistant.service?.cohere?.summarize as CohereServiceConfig;
    super(aiAssistant, 'https://api.cohere.ai/v1/summarize', 'Insert text to summarize', config, key);
  }

  override preprocessBody(body: CohereSummarizeConfig, messages: MessageContent[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body));
    const mostRecentMessageText = messages[messages.length - 1].text;
    if (!mostRecentMessageText) return;
    return {text: mostRecentMessageText, ...bodyCopy};
  }

  async extractResultData(result: CohereSummarizeResult): Promise<Result> {
    if (result.message) throw result.message;
    return {text: result.summary || ''};
  }
}
