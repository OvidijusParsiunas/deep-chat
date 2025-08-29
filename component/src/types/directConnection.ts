<<<<<<< HEAD
import { HuggingFace } from './huggingFace'
import { StabilityAI } from './stabilityAI'
import { AssemblyAI } from './assemblyAI'
import { OpenRouter } from './openRouter'
import { DeepSeek } from './deepSeek'
import { Mistral } from './mistral'
import { APIKey } from './APIKey'
import { Cohere } from './cohere'
import { Gemini } from './gemini'
import { OpenAI } from './openAI'
import { Claude } from './claude'
import { Azure } from './azure'
import { Kimi } from './kimi'
import { Grok } from './grok'
import { Ollama } from './ollama'

export interface DirectConnection {
  openAI?: OpenAI & APIKey
  huggingFace?: HuggingFace & APIKey
  mistral?: Mistral & APIKey
  stabilityAI?: StabilityAI & APIKey
  cohere?: Cohere & APIKey
  gemini?: Gemini & APIKey
  azure?: Azure & APIKey
  assemblyAI?: AssemblyAI & APIKey
  claude?: Claude & APIKey
  deepSeek?: DeepSeek & APIKey
  kimi?: Kimi & APIKey
  openRouter?: OpenRouter & APIKey
  grok?: Grok & APIKey
  ollama?: Ollama & APIKey
=======
import {HuggingFace} from './huggingFace';
import {StabilityAI} from './stabilityAI';
import {AssemblyAI} from './assemblyAI';
import {OpenRouter} from './openRouter';
import {DeepSeek} from './deepSeek';
import {Together} from './together';
import {BigModel} from './bigModel';
import {Mistral} from './mistral';
import {APIKey} from './APIKey';
import {Cohere} from './cohere';
import {Gemini} from './gemini';
import {OpenAI} from './openAI';
import {Claude} from './claude';
import {Ollama} from './ollama';
import {Azure} from './azure';
import {Groq} from './groq';
import {Kimi} from './kimi';
import {Grok} from './grok';
import {Qwen} from './qwen';

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
  qwen?: Qwen & APIKey;
  together?: Together & APIKey;
  bigModel?: BigModel & APIKey;
  groq?: Groq & APIKey;
  ollama?: Ollama;
>>>>>>> upstream/main
}
