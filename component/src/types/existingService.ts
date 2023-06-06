import {HuggingFace} from './huggingFace';
import {AssemblyAI} from './assemblyAI';
import {Cohere} from './cohere';
import {OpenAI} from './openAI';
import {Azure} from './azure';
import {Demo} from './demo';

export interface ExistingService {
  openAI?: OpenAI;
  huggingFace?: HuggingFace;
  azure?: Azure;
  cohere?: Cohere;
  assemblyAI?: AssemblyAI;
  demo?: Demo;
}
