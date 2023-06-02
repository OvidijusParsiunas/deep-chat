import {OpenAIConverseBodyInternal} from '../../../types/openAIInternal';
import {OpenAIConverse} from '../../../types/openAI';

type ClientConfig = true | OpenAIConverse;
type ModelName =
  | typeof OpenAIConverseBaseBody.GPT_COMPLETIONS_DAVINCI_MODEL
  | typeof OpenAIConverseBaseBody.GPT_CHAT_TURBO_MODEL;

// contains body properties that are not dependent on the message(s) sent
export class OpenAIConverseBaseBody {
  public static readonly GPT_COMPLETIONS_DAVINCI_MODEL = 'text-davinci-003';
  public static readonly GPT_CHAT_TURBO_MODEL = 'gpt-3.5-turbo';

  private static generateDefaultBody(modelName: ModelName): OpenAIConverseBodyInternal {
    return {
      model: modelName,
    };
  }

  public static build(modelName: ModelName, clientConfig?: ClientConfig): OpenAIConverseBodyInternal {
    const defaultBody = OpenAIConverseBaseBody.generateDefaultBody(modelName);
    if (!clientConfig || typeof clientConfig === 'boolean') return defaultBody;
    return Object.assign(defaultBody, clientConfig);
  }
}
