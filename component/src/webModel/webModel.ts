import {BaseServiceIO} from '../services/utils/baseServiceIO';
import {MessageContentI} from '../types/messagesInternal';
import {Messages} from '../views/chat/messages/messages';
import * as WebLLM from '../types/webLLM/webLLM';
// import * as WebLLM2 from '@mlc-ai/web-llm';
import config from './webModelConfig';
import {DeepChat} from '../deepChat';

declare global {
  interface Window {
    webLLM: typeof WebLLM;
  }
}

// WORK
// currently does not support adding an existing conversation - see if a custom implementation can be used:
// https://github.com/mlc-ai/web-llm/issues?q=conversation
// WORK
// create a type library to prevent build time warnings e.g:
// [plugin:vite:resolve] Module "perf_hooks" has been externalized for browser compatibility, imported by
// "/Users/ovidijusparsiunas/Desktop/ai-chat/component/node_modules/@mlc-ai/web-llm/lib/index.js".
// See http://vitejs.dev/guide/troubleshooting.html#module-externalized-for-browser-compatibility for more details.
export class WebModel extends BaseServiceIO {
  private readonly chat?: WebLLM.ChatInterface;
  // private readonly localChat: WebLLM.ChatInterface;
  private readonly selectedModel: string = 'Llama-2-7b-chat-hf-q4f32_1';
  private chatLoaded = false;

  constructor(deepChat: DeepChat) {
    super(deepChat);
    // window.webLLM = WebLLM2 as unknown as typeof WebLLM;
    // WORk - handle error
    if (!window.webLLM) return;
    const webLLM = window.webLLM;
    const useWebWorker = config.use_web_worker;
    const chat = useWebWorker
      ? new webLLM.ChatWorkerClient(new Worker(new URL('./worker.ts', import.meta.url), {type: 'module'}))
      : new webLLM.ChatModule();
    // this.localChat = new window.webLLM.ChatRestModule();
    setTimeout(() => {
      this.asyncInitChat(chat);
    }, 2000);
    this.chat = chat;
  }

  private async asyncInitChat(chat: WebLLM.ChatInterface) {
    // const hasIt = await window.webLLM.hasModelInCache(this.selectedModel, config);
    // console.log(hasIt);
    if (this.chatLoaded) return;
    const initProgressCallback = (report: WebLLM.InitProgressReport) => {
      console.log(report);
      console.log('initializing');
    };
    chat.setInitProgressCallback(initProgressCallback);

    try {
      await chat.reload(this.selectedModel, {conv_config: {system: 'keep responses to one sentence'}}, config);
    } catch (err) {
      console.error('initialzitaion error');
      console.log(err);
      this.unloadChat();
      return;
    }
    console.log('ready');
    this.chatLoaded = true;
  }

  private static callbackUpdateResponse(_: number, msg: string) {
    console.log(msg);
  }

  override async callServiceAPI(messages: Messages, pMessages: MessageContentI[], __?: File[]) {
    if (!this.chat || !this.chatLoaded) return;
    const message = pMessages[pMessages.length - 1].text as string;
    try {
      const output = await this.chat.generate(message, WebModel.callbackUpdateResponse, 0);
      messages.addNewMessage({text: output});
      this.completionsHandlers.onFinish();
    } catch (err) {
      console.error('error');
      await this.unloadChat();
    }
  }

  private async unloadChat() {
    if (!this.chat) return;
    await this.chat.unload();
    this.chatLoaded = false;
  }
}
