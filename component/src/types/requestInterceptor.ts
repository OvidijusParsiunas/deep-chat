import {OpenAIChat, OpenAICompletions} from './openAI';

export type RequestInterceptor = (requestBody: OpenAIChat | OpenAICompletions) => object;
