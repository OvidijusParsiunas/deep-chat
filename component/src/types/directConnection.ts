import {HuggingFace} from './huggingFace';
import {StabilityAI} from './stabilityAI';
import {AssemblyAI} from './assemblyAI';
import {OpenRouter} from './openRouter';
import {DeepSeek} from './deepSeek';
import {Mistral} from './mistral';
import {APIKey} from './APIKey';
import {Cohere} from './cohere';
import {Gemini} from './gemini';
import {OpenAI} from './openAI';
import {Claude} from './claude';
import {Ollama} from './ollama';
import {Azure} from './azure';
import {Kimi} from './kimi';
import {Grok} from './grok';

export interface DirectConnection {
  openAI?: OpenAI & APIKey;
  huggingFace?: HuggingFace & APIKey;
  mistral?: Mistral & APIKey;
  stabilityAI?: StabilityAI & APIKey;
  cohere?: Cohere & APIKey;
  gemini?: Gemini & APIKey;
  azure?: Azure & APIKey;
  assemblyAI?: AssemblyAI & APIKey;
  claude?: Claude & APIKey;
  deepSeek?: DeepSeek & APIKey;
  kimi?: Kimi & APIKey;
  openRouter?: OpenRouter & APIKey;
  grok?: Grok & APIKey;
  ollama?: Ollama;
}
