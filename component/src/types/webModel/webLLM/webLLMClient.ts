import {MLCEngineConfig, MLCEngineInterface} from './webLLMShared';

// A client engine that offloads the model to a Web Worker, exposing the same interface.
// new window.webLLM.WebWorkerMLCEngine(worker, engineConfig?)
// The worker script must instantiate a WebWorkerMLCEngineHandler (see deep-chat-web-llm docs).
export declare const WebWorkerMLCEngine: new (worker: Worker, engineConfig?: MLCEngineConfig) => MLCEngineInterface;
