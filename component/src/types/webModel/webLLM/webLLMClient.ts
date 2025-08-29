/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  GenerateProgressCallback,
  InitProgressCallback,
  InitProgressReport,
  ChatInterface,
  ChatOptions,
  AppConfig,
} from './webLLMShared';

interface ReloadParams {
  localIdOrUrl: string;
  chatOpts?: ChatOptions;
  appConfig?: AppConfig;
}
interface GenerateParams {
  input: string;
  streamInterval?: number;
}
interface GenerateProgressCallbackParams {
  step: number;
  currentMessage: string;
}
type MessageContent = GenerateProgressCallbackParams | ReloadParams | GenerateParams | InitProgressReport | string | null;

export declare class ChatWorkerHandler {
  private readonly chat;
  constructor(chat: ChatInterface);
  handleTask<T extends MessageContent>(uuid: string, task: () => Promise<T>): Promise<void>;
  onmessage(event: MessageEvent): void;
}
interface ChatWorker {
  onmessage: any;
  postMessage: (message: any) => void;
}

export declare class ChatWorkerClient implements ChatInterface {
  worker: ChatWorker;
  private readonly initProgressCallback?;
  private readonly generateCallbackRegistry;
  private readonly pendingPromise;
  constructor(worker: any);
  setInitProgressCallback(initProgressCallback: InitProgressCallback): void;
  private readonly getPromise;
  reload(localIdOrUrl: string, chatOpts?: ChatOptions, appConfig?: AppConfig): Promise<void>;
  generate(input: string, progressCallback?: GenerateProgressCallback, streamInterval?: number): Promise<string>;
  runtimeStatsText(): Promise<string>;
  interruptGenerate(): void;
  unload(): Promise<void>;
  resetChat(): Promise<void>;
  onmessage(event: any): void;
}
