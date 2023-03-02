import {OpenAIInternal, OpenAIInternalParams} from '../../types/openAIInternal';
import {OpenAI} from '../../types/openAI';

export class OpenAIAssembler {
  private static DEFAULT_PARAMS: OpenAIInternal = {
    chat: {
      model: 'gpt-3.5-turbo',
      messages: [{role: 'user', content: 'Hello world'}],
    },
    completions: {
      model: 'text-curie-001',
    },
  };

  public static assemble(openAI?: OpenAI): OpenAIInternalParams {
    const openAIInternal: OpenAI = JSON.parse(JSON.stringify(openAI || OpenAIAssembler.DEFAULT_PARAMS));
    if (openAIInternal?.chat) {
      if (typeof openAIInternal.chat === 'boolean') return OpenAIAssembler.DEFAULT_PARAMS.chat;
      return Object.assign(OpenAIAssembler.DEFAULT_PARAMS.chat, openAIInternal.chat);
    }
    if (typeof openAIInternal.completions === 'boolean') return OpenAIAssembler.DEFAULT_PARAMS.completions;
    return Object.assign(OpenAIAssembler.DEFAULT_PARAMS.completions, openAIInternal.completions);
  }
}
