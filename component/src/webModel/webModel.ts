import {WebModel as WebModelT} from '../types/webModel/webModel';
import {MessageUtils} from '../views/chat/messages/messageUtils';
import {BaseServiceIO} from '../services/utils/baseServiceIO';
import {MessageContentI} from '../types/messagesInternal';
import * as WebLLM from '../types/webModel/webLLM/webLLM';
import {Messages} from '../views/chat/messages/messages';
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
  private static readonly DOWNLOAD_BUTTON_CLASS = 'deep-chat-download-button';
  private readonly _selectedModel: string = 'Llama-2-7b-chat-hf-q4f32_1';
  private _isModelLoaded = false;
  private _isModelLoading = false;
  private _loadOnFirstMessage = false;

  constructor(deepChat: DeepChat) {
    super(deepChat);
    // window.webLLM = WebLLM2 as unknown as typeof WebLLM;
    // WORK - handle error
    if (!window.webLLM) return;
    const webLLM = window.webLLM;
    const useWebWorker = config.use_web_worker;
    const chat = useWebWorker
      ? new webLLM.ChatWorkerClient(new Worker(new URL('./worker.ts', import.meta.url), {type: 'module'}))
      : new webLLM.ChatModule();
    // this.localChat = new window.webLLM.ChatRestModule();
    this.chat = chat;
    this.canSendMessage = this.canSubmit.bind(this);
    setTimeout(() => {
      // in timeout for this.addMessage to be set
      const isMessageSet = this.addInitialMessage(chat, deepChat);
      this.configureLoad(chat, isMessageSet, deepChat._webModel);
    });
  }

  private addInitialMessage(chat: WebLLM.ChatInterface, deepChat: DeepChat) {
    const {_webModel} = deepChat;
    const initialMessage = typeof _webModel === 'object' ? _webModel.initialMessage : undefined;
    if (!_webModel || initialMessage?.displayed === false) return false;
    const downloadClass = initialMessage?.downloadClass || WebModel.DOWNLOAD_BUTTON_CLASS;
    const text = `
      Download a web model that will run entirely on your browser.
      <br/> <button style="margin-top: 10px; margin-bottom: 5px; margin-left: 1px"
        class="${downloadClass} deep-chat-button">Download</button>`;
    const html = initialMessage?.html || `<div class="deep-chat-update-message">${text}</div>`;
    this.addMessage?.({role: MessageUtils.AI_ROLE, html, sendUpdate: false});
    const button = deepChat.shadowRoot?.children[0]?.getElementsByClassName(downloadClass)[0] as HTMLButtonElement;
    if (button) button.onclick = this.loadModel.bind(this, chat);
    return true;
  }

  private canSubmit(text?: string) {
    if (!text?.trim() || this._isModelLoading) return false;
    if (this._loadOnFirstMessage) return true;
    return !!this._isModelLoaded;
  }

  private async configureLoad(chat: WebLLM.ChatInterface, isMessageSet: boolean, webModel?: WebModelT) {
    if (webModel && typeof webModel !== 'boolean' && webModel.load) {
      if (webModel.load.onInit) {
        this.loadModel(chat);
        return;
      }
      if (webModel.load.onMessage) {
        this._loadOnFirstMessage = true;
        return;
      }
    }
    if (!isMessageSet) this.loadModel(chat);
  }

  // prettier-ignore
  private async loadModel(chat: WebLLM.ChatInterface) {
    // const hasIt = await window.webLLM.hasModelInCache(this.selectedModel, config);
    // console.log(hasIt);
    if (this._isModelLoaded) return;
    this._isModelLoading = true;
    const initProgressCallback = (report: WebLLM.InitProgressReport) => {
      this.addMessage?.({html: `<div class="deep-chat-update-message">${report.text}</div>`, sendUpdate: false});
    };
    chat.setInitProgressCallback(initProgressCallback);

    try {
      await chat.reload(this._selectedModel, {conv_config: {system: 'keep responses to one sentence'}}, config);
    } catch (err) {
      console.error('initialzitaion error');
      console.log(err);
      this.unloadChat();
      return;
    }
    this.addMessage?.({html: `<div class="deep-chat-update-message">Model loaded</div>`, sendUpdate: false});
    this._isModelLoaded = true;
    this._isModelLoading = false;
  }

  private async immediateResp(messages: Messages, text: string, chat: WebLLM.ChatInterface) {
    const output = await chat.generate(text, undefined, 0); // anything but 1 will not stream
    messages.addNewMessage({text: output});
    this.completionsHandlers.onFinish();
  }

  private static callbackUpdateResponse(messages: Messages, _: number, msg: string) {
    if (!messages.isStreamingText()) messages.addNewStreamedMessage();
    messages.updateStreamedMessage(msg, false);
  }

  private async streamResp(messages: Messages, text: string, chat: WebLLM.ChatInterface) {
    this.streamHandlers.abortStream.abort = () => {
      chat.interruptGenerate();
    };
    this.streamHandlers.onOpen();
    await chat.generate(text, WebModel.callbackUpdateResponse.bind(this, messages));
    if (!messages.isStreamingText()) messages.addNewStreamedMessage(); // needed when early abort clicked
    messages.finaliseStreamedMessage();
    this.streamHandlers.onClose();
  }

  private async generateResp(messages: Messages, pMessages: MessageContentI[], chat: WebLLM.ChatInterface) {
    const text = pMessages[pMessages.length - 1].text as string;
    try {
      if (this.deepChat.stream) {
        this.streamResp(messages, text, chat);
      } else {
        this.immediateResp(messages, text, chat);
      }
    } catch (err) {
      console.error('error');
      await this.unloadChat();
    }
  }

  override async callServiceAPI(messages: Messages, pMessages: MessageContentI[], __?: File[]) {
    if (!this.chat || this._isModelLoading) return;
    if (!this._isModelLoaded) {
      if (this._loadOnFirstMessage) {
        await this.loadModel(this.chat);
      } else {
        return;
      }
    }
    messages.addLoadingMessage();
    this.generateResp(messages, pMessages, this.chat);
  }

  private async unloadChat() {
    if (!this.chat) return;
    await this.chat.unload();
    this._isModelLoaded = false;
  }

  override isWebModel() {
    return true;
  }
}
