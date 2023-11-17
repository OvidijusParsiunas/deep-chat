import {BaseServiceIO} from '../services/utils/baseServiceIO';
import {MessageContentI} from '../types/messagesInternal';
import {Messages} from '../views/chat/messages/messages';
import * as WebLLM from '@mlc-ai/web-llm';
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
export class WebModel extends BaseServiceIO {
  private readonly chat: WebLLM.ChatInterface;
  // private readonly localChat: WebLLM.ChatInterface;
  private readonly selectedModel: string = 'Llama-2-7b-chat-hf-q4f32_1';
  private chatLoaded = false;

  constructor(deepChat: DeepChat) {
    super(deepChat);
    // WORK - handle no webLLM error
    // window.webLLM = WebLLM;
    const useWebWorker = config.use_web_worker;
    if (useWebWorker) {
      this.chat = new window.webLLM.ChatWorkerClient(
        new Worker(new URL('./worker.ts', import.meta.url), {type: 'module'})
      );
      // this.localChat = new window.webLLM.ChatRestModule();
    } else {
      this.chat = new window.webLLM.ChatModule();
      // this.localChat = new window.webLLM.ChatRestModule();
    }
    setTimeout(() => {
      this.asyncInitChat();
    }, 2000);
  }

  private async asyncInitChat() {
    // const hello = await window.webLLM.hasModelInCache(this.selectedModel, config);
    // console.log(hello);
    if (this.chatLoaded) return;
    const initProgressCallback = (report: WebLLM.InitProgressReport) => {
      console.log(report);
      console.log('initializing');
    };
    this.chat.setInitProgressCallback(initProgressCallback);

    try {
      await this.chat.reload(this.selectedModel, {conv_config: {system: 'keep responses to one sentence'}}, config);
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
    if (!this.chatLoaded) return;
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
    await this.chat.unload();
    this.chatLoaded = false;
  }
}
