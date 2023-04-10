import {OpenAIInternal, OpenAIInternalBody} from '../../../types/openAIInternal';
import {OpenAI} from '../../../types/openAI';

export class OpenAIBaseBodyGenerator {
  private static readonly DEFAULT_MAX_TOKENS = 4097;
  public static readonly GPT_CHAT_TURBO_MODEL = 'gpt-3.5-turbo';
  private static readonly GPT_COMPLETIONS_DAVINCI_MODEL = 'gpt-3.5-turbo';

  private static readonly DEFAULT_PARAMS: OpenAIInternal = {
    chat: {
      model: OpenAIBaseBodyGenerator.GPT_CHAT_TURBO_MODEL,
      systemMessage: {role: 'system', content: 'You are a helpful assistant.'},
      max_tokens: OpenAIBaseBodyGenerator.DEFAULT_MAX_TOKENS,
    },
    completions: {
      model: OpenAIBaseBodyGenerator.GPT_COMPLETIONS_DAVINCI_MODEL,
      max_tokens: OpenAIBaseBodyGenerator.DEFAULT_MAX_TOKENS,
    },
  };

  private static buildBaseBody(openAIInternal: OpenAI, type: keyof OpenAI) {
    if (typeof openAIInternal[type] === 'boolean') return OpenAIBaseBodyGenerator.DEFAULT_PARAMS[type];
    const baseBody = Object.assign(OpenAIBaseBodyGenerator.DEFAULT_PARAMS[type], openAIInternal[type]);
    baseBody.model ??= OpenAIBaseBodyGenerator.DEFAULT_PARAMS[type].model;
    baseBody.max_tokens ??= OpenAIBaseBodyGenerator.DEFAULT_PARAMS[type].max_tokens;
    return baseBody;
  }

  public static assemble(openAI?: OpenAI, context?: string): OpenAIInternalBody {
    const openAIInternal: OpenAI = JSON.parse(JSON.stringify(openAI || OpenAIBaseBodyGenerator.DEFAULT_PARAMS));
    if (openAIInternal?.chat) {
      const baseBody = OpenAIBaseBodyGenerator.buildBaseBody(openAIInternal, 'chat');
      if (context) baseBody.systemMessage = {role: 'system', content: context};
      return baseBody;
    }
    return OpenAIBaseBodyGenerator.buildBaseBody(openAIInternal, 'completions');
  }
}
