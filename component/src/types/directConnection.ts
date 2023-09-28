import {HuggingFace} from './huggingFace';
import {StabilityAI} from './stabilityAI';
import {AssemblyAI} from './assemblyAI';
import {APIKey} from './APIKey';
import {Cohere} from './cohere';
import {OpenAI} from './openAI';
import {Azure} from './azure';

export interface DirectConnection {
  openAI?: OpenAI & APIKey;
  huggingFace?: HuggingFace & APIKey;
  azure?: Azure & APIKey;
  cohere?: Cohere & APIKey;
  stabilityAI?: StabilityAI & APIKey;
  assemblyAI?: AssemblyAI & APIKey;
}
