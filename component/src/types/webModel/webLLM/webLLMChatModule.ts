import {AppConfig, ChatInterface, ChatOptions, GenerateProgressCallback, InitProgressCallback} from './webLLMShared';

export declare class ChatModule implements ChatInterface {
  private readonly logger;
  private readonly pipeline?;
  private readonly initProgressCallback?;
  private readonly interruptSignal;
  setInitProgressCallback(initProgressCallback: InitProgressCallback): void;
  reload(localId: string, chatOpts?: ChatOptions, appConfig?: AppConfig): Promise<void>;
  generate(input: string, progressCallback?: GenerateProgressCallback, streamInterval?: number): Promise<string>;
  interruptGenerate(): Promise<void>;
  runtimeStatsText(): Promise<string>;
  resetChat(): Promise<void>;
  unload(): Promise<void>;
  stopped(): boolean;
  getMessage(): string;
  prefill(input: string): Promise<void>;
  decode(): Promise<void>;
  private readonly getPipeline;
  private readonly asyncLoadTokenizer;
}
