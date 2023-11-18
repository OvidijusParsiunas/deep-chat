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
  /**
   * @returns Whether the generation stopped.
   */
  stopped(): boolean;
  /**
   * Get the current generated response.
   *
   * @returns The current output message.
   */
  getMessage(): string;
  /**
   * Run a prefill step with a given input.
   * @param input The input prompt.
   */
  prefill(input: string): Promise<void>;
  /**
   * Run a decode step to decode the next token.
   */
  decode(): Promise<void>;
  private readonly getPipeline;
  private readonly asyncLoadTokenizer;
}
