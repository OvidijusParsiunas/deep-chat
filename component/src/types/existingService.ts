import {HuggingFace} from './huggingFace';
import {AssemblyAI} from './assemblyAI';
import {APIKey} from './APIKey';
import {Cohere} from './cohere';
import {OpenAI} from './openAI';
import {Azure} from './azure';
import {Demo} from './demo';

export interface ExistingService {
  openAI?: OpenAI & APIKey;
  huggingFace?: HuggingFace & APIKey;
  azure?: Azure & APIKey;
  cohere?: Cohere & APIKey;
  assemblyAI?: AssemblyAI & APIKey;
  demo?: Demo;
}
