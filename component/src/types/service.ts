import {CustomServiceConfig} from './customService';
import {HuggingFace} from './huggingFace';
import {AssemblyAI} from './assemblyAI';
import {Cohere} from './cohere';
import {OpenAI} from './openAI';
import {Azure} from './azure';

export interface Service {
  openAI?: OpenAI;
  huggingFace?: HuggingFace;
  azure?: Azure;
  cohere?: Cohere;
  assemblyAI?: AssemblyAI;
  custom?: CustomServiceConfig;
}
