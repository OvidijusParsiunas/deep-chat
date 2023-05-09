import {CustomServiceConfig} from './customService';
import {HuggingFace} from './huggingFace';
import {AssemblyAI} from './assemblyAI';
import {Cohere} from './cohere';
import {OpenAI} from './openAI';

export interface Service {
  openAI?: OpenAI;
  assemblyAI?: AssemblyAI;
  cohere?: Cohere;
  huggingFace?: HuggingFace;
  custom?: CustomServiceConfig;
}
