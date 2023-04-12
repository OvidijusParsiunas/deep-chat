import {OpenAIBodyInternal} from '../../../types/openAIInternal';
import {OpenAIConfig} from '../../../types/openAI';

type ClientConfig = true | OpenAIConfig;
type ModelName = typeof OpenAIBaseBody.GPT_CHAT_TURBO_MODEL | typeof OpenAIBaseBody.GPT_CHAT_TURBO_MODEL;

export class OpenAIBaseBody {
  public static readonly GPT_COMPLETIONS_DAVINCI_MODEL = 'gpt-3.5-turbo';
  public static readonly GPT_CHAT_TURBO_MODEL = 'gpt-3.5-turbo';

  private static generateDefaultConfig(modelName: ModelName): OpenAIBodyInternal {
    return {
      model: modelName,
    };
  }

  public static build(modelName: ModelName, clientConfig?: ClientConfig): OpenAIBodyInternal {
    const defaultConfig = OpenAIBaseBody.generateDefaultConfig(modelName);
    if (!clientConfig || typeof clientConfig === 'boolean') return defaultConfig;
    return Object.assign(defaultConfig, clientConfig);
  }
}
