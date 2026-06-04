import {MLCEngineConfig, MLCEngineInterface} from './webLLMShared';

// The in-page engine that runs the model on the main thread.
// new window.webLLM.MLCEngine(engineConfig?)
export declare const MLCEngine: new (engineConfig?: MLCEngineConfig) => MLCEngineInterface;
