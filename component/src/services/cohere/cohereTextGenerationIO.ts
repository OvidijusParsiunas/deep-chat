import {CohereCompletionsResult} from '../../types/cohereResult';
import {ServiceCallConfig} from '../../types/requestSettings';
import {CohereGenerateConfig} from '../../types/cohere';
import {MessageContent} from '../../types/messages';
import {GenericObject} from '../../types/object';
import {AiAssistant} from '../../aiAssistant';
import {Result} from '../../types/result';
import {CohereIO} from './cohereIO';

type CohereServiceConfig = GenericObject<string> & ServiceCallConfig;

export class CohereTextGenerationIO extends CohereIO {
  constructor(aiAssistant: AiAssistant) {
    // config can be undefined as this is the default service
    const config = aiAssistant.service?.cohere?.textGeneration as CohereServiceConfig | undefined;
    super(aiAssistant, 'https://api.cohere.ai/v1/generate', 'Once upon a time', config);
  }

  override preprocessBody(body: CohereGenerateConfig, messages: MessageContent[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body));
    const mostRecentMessageText = messages[messages.length - 1].text;
    if (!mostRecentMessageText) return;
    return {prompt: mostRecentMessageText, ...bodyCopy};
  }

  async extractResultData(result: CohereCompletionsResult): Promise<Result> {
    if (result.message) throw result.message;
    return {text: result.generations?.[0].text || ''};
  }
}
