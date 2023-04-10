import {OpenAIInternal, OpenAIInternalBody} from '../../../types/openAIInternal';
import {OpenAI} from '../../../types/openAI';

export class OpenAIBaseBodyGenerator {
  public static readonly GPT_CHAT_TURBO_MODEL = 'gpt-3.5-turbo';
  private static readonly GPT_COMPLETIONS_DAVINCI_MODEL = 'text-davinci-003';

  private static readonly DEFAULT_PARAMS: OpenAIInternal = {
    chat: {
      model: OpenAIBaseBodyGenerator.GPT_CHAT_TURBO_MODEL,
      systemMessage: {role: 'system', content: 'You are a helpful assistant.'},
    },
    completions: {
      model: OpenAIBaseBodyGenerator.GPT_COMPLETIONS_DAVINCI_MODEL,
    },
  };

  private static buildBaseBody(openAIInternal: OpenAI, type: keyof OpenAI) {
    if (typeof openAIInternal[type] === 'boolean') return OpenAIBaseBodyGenerator.DEFAULT_PARAMS[type];
    const baseBody = Object.assign(OpenAIBaseBodyGenerator.DEFAULT_PARAMS[type], openAIInternal[type]);
    baseBody.model ??= OpenAIBaseBodyGenerator.DEFAULT_PARAMS[type].model;
    return baseBody;
  }

  public static assemble(openAI?: OpenAI, context?: string): OpenAIInternalBody {
    const openAIInternal: OpenAI = JSON.parse(JSON.stringify(openAI || OpenAIBaseBodyGenerator.DEFAULT_PARAMS));
    if (openAIInternal?.chat) {
      const baseBody = OpenAIBaseBodyGenerator.buildBaseBody(openAIInternal, 'chat');
      if (context) baseBody.systemMessage = {role: 'system', content: context};
      return baseBody;
    }
    const baseBody = OpenAIBaseBodyGenerator.buildBaseBody(openAIInternal, 'completions');
    // Completions with no max_tokens behave weirdly and do not give full responses
    // text-davinci-003 total max limit is 4097, hence setting max_totals (number of tokens to reply) to 2000 to allow
    // the insertion of same amount of tokens. Client should specify their own max_tokens.
    baseBody.max_tokens ??= 2000;
    return baseBody;
  }
}
