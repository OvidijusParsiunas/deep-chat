import {OpenAIChatBody, OpenAICompletionsBody} from './openAIBodies';

export type RequestInterceptor = (requestBody: OpenAIChatBody | OpenAICompletionsBody) => object;
