import {HuggingFace} from './huggingFace';
import {StabilityAI} from './stabilityAI';
import {AssemblyAI} from './assemblyAI';
import {Mistral} from './mistral';
import {APIKey} from './APIKey';
import {Cohere} from './cohere';
import {OpenAI} from './openAI';
import {Azure} from './azure';

export interface DirectConnection {
  openAI?: OpenAI & APIKey;
  huggingFace?: HuggingFace & APIKey;
  mistral?: Mistral & APIKey;
  stabilityAI?: StabilityAI & APIKey;
  cohere?: Cohere & APIKey;
  azure?: Azure & APIKey;
  assemblyAI?: AssemblyAI & APIKey;
}
