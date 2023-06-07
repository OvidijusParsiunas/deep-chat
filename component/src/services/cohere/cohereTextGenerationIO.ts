import {CohereCompletionsResult} from '../../types/cohereResult';
import {CohereGenerateConfig} from '../../types/cohere';
import {MessageContent} from '../../types/messages';
import {GenericObject} from '../../types/object';
import {Result} from '../../types/result';
import {DeepChat} from '../../deepChat';
import {CohereIO} from './cohereIO';

type CohereServiceConfig = GenericObject<string>;

export class CohereTextGenerationIO extends CohereIO {
  constructor(deepChat: DeepChat) {
    // config can be undefined as this is the default service
    const config = deepChat.existingService?.cohere?.textGeneration as CohereServiceConfig | undefined;
    super(deepChat, 'https://api.cohere.ai/v1/generate', 'Once upon a time', config);
  }

  override preprocessBody(body: CohereGenerateConfig, messages: MessageContent[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body));
    const mostRecentMessageText = messages[messages.length - 1].text;
    if (!mostRecentMessageText) return;
    return {prompt: mostRecentMessageText, ...bodyCopy};
  }

  override async extractResultData(result: CohereCompletionsResult): Promise<Result> {
    if (result.message) throw result.message;
    return {text: result.generations?.[0].text || ''};
  }
}
