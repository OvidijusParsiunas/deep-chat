import {OpenAIInternal, OpenAIInternalParams} from '../../types/openAIInternal';
import {OpenAI} from '../../types/openAI';

export class OpenAIParamAssembler {
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
    const openAIInternal: OpenAI = JSON.parse(JSON.stringify(openAI || OpenAIParamAssembler.DEFAULT_PARAMS));
    if (openAIInternal?.chat) {
      if (typeof openAIInternal.chat === 'boolean') return OpenAIParamAssembler.DEFAULT_PARAMS.chat;
      return Object.assign(OpenAIParamAssembler.DEFAULT_PARAMS.chat, openAIInternal.chat);
    }
    if (typeof openAIInternal.completions === 'boolean') return OpenAIParamAssembler.DEFAULT_PARAMS.completions;
    return Object.assign(OpenAIParamAssembler.DEFAULT_PARAMS.completions, openAIInternal.completions);
  }
}
