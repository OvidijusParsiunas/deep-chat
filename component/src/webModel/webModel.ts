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
// create a separate library to faciliate webworkers.
export class WebModel extends BaseServiceIO {
  private static chat?: WebLLM.ChatInterface;
  private static readonly DOWNLOAD_BUTTON_CLASS = 'deep-chat-download-button';
  private static readonly GENERIC_ERROR =
    'ERROR. Your browser may not support this model. ' +
    'Please check the following setup [instructions](https://webllm.mlc.ai/#instructions).';
  private static readonly MULTIPLE_MODELS_ERROR = 'Cannot run multiple web models';
  private static readonly WEB_LLM_NOT_FOUND_ERROR = 'WebLLM module not found';
  private static readonly DEFAULT_MODEL = 'Llama-2-7b-chat-hf-q4f32_1';
  private _isModelLoaded = false;
  private _isModelLoading = false;
  private _loadOnFirstMessage = false;
  permittedErrorPrefixes = [WebModel.MULTIPLE_MODELS_ERROR, WebModel.WEB_LLM_NOT_FOUND_ERROR, WebModel.GENERIC_ERROR];
  private readonly webModel: WebModelT = false;

  constructor(deepChat: DeepChat) {
    super(deepChat);
    // window.webLLM = WebLLM2 as unknown as typeof WebLLM;
    this.webModel = deepChat._webModel;
    if (deepChat.shadowRoot) this.findModelInWindow(deepChat.shadowRoot);
    this.canSendMessage = this.canSubmit.bind(this);
  }

  private findModelInWindow(shadowRoot: ShadowRoot, seconds = 0) {
    if (window.webLLM) {
      setTimeout(() => {
        // in timeout for this.addMessage to be set
        const wasMessageSet = this.addInitialMessage(shadowRoot);
        this.configureInit(wasMessageSet);
      });
    } else if (seconds > 5) {
      this.addMessage?.({error: WebModel.WEB_LLM_NOT_FOUND_ERROR, sendUpdate: false});
      console.error(
        'The WebLLM module is either not in the project or not been attached to the window object. ' +
          'Please see the following guide:'
      );
      // WORK
      console.error('Hello World');
    } else {
      setTimeout(() => {
        this.findModelInWindow(shadowRoot, seconds + 1);
      }, 1000);
    }
  }

  private addInitialMessage(shadowRoot: ShadowRoot) {
    const initialMessage = typeof this.webModel === 'object' ? this.webModel.initialMessage : undefined;
    if (!this.webModel || initialMessage?.displayed === false) return false;
    const downloadClass = initialMessage?.downloadClass || WebModel.DOWNLOAD_BUTTON_CLASS;
    const text = `
      Download a web model that will run entirely on your browser.
      <br/> <button style="margin-top: 10px; margin-bottom: 5px; margin-left: 1px"
        class="${downloadClass} deep-chat-button">Download</button>`;
    const html = initialMessage?.html || `<div class="deep-chat-update-message">${text}</div>`;
    this.addMessage?.({role: MessageUtils.AI_ROLE, html, sendUpdate: false});
    const button = shadowRoot.children[0]?.getElementsByClassName(downloadClass)[0] as HTMLButtonElement;
    if (button) button.onclick = this.init.bind(this);
    return true;
  }

  private async configureInit(wasMessageSet: boolean) {
    if (this.webModel && typeof this.webModel !== 'boolean' && this.webModel.load) {
      if (this.webModel.load.onInit) {
        this.init();
        return;
      }
      if (this.webModel.load.onMessage) {
        this._loadOnFirstMessage = true;
        return;
      }
    }
    if (!wasMessageSet) this.init();
  }

  private async init() {
    const chat = this.attemptToCreateChat();
    if (chat) this.loadModel(chat);
  }

  private attemptToCreateChat() {
    if (WebModel.chat) {
      this.addMessage?.({error: WebModel.MULTIPLE_MODELS_ERROR, sendUpdate: false});
      console.error(WebModel.MULTIPLE_MODELS_ERROR);
      return;
    }
    if (this._isModelLoaded || this._isModelLoading) return;
    return config.use_web_worker
      ? new window.webLLM.ChatWorkerClient(new Worker(new URL('./worker.ts', import.meta.url), {type: 'module'}))
      : new window.webLLM.ChatModule();
  }

  private getConfig() {
    let model = WebModel.DEFAULT_MODEL;
    if (this.webModel && typeof this.webModel !== 'boolean') {
      if (this.webModel.model) model = this.webModel.model;
      const newConfig = JSON.parse(JSON.stringify(config)) as typeof config;
      if (this.webModel.modelUrl) {
        const modelConfig = newConfig.model_list.find((modelConfig) => (modelConfig.local_id = model));
        if (modelConfig) modelConfig.model_url = this.webModel.modelUrl;
      }
      if (this.webModel.wasmUrl) {
        const modelKey = model as keyof typeof newConfig.model_lib_map;
        const wasm = newConfig.model_lib_map[modelKey];
        if (wasm) newConfig.model_lib_map[modelKey] = `${this.webModel.wasmUrl}${model}-webgpu.wasm`;
      }
      return {model, pConfig: newConfig};
    }
    return {model, pConfig: config};
  }

  private async loadModel(chat: WebLLM.ChatInterface) {
    WebModel.chat = chat;
    // await window.webLLM.hasModelInCache(this.selectedModel, config); can potentially reuse this in the future
    this._isModelLoading = true;
    const initProgressCallback = (report: WebLLM.InitProgressReport) => {
      this.addMessage?.({html: `<div class="deep-chat-update-message">${report.text}</div>`, sendUpdate: false});
    };
    WebModel.chat.setInitProgressCallback(initProgressCallback);
    try {
      const {model, pConfig} = this.getConfig();
      await WebModel.chat.reload(model, {conv_config: {system: 'keep responses to one sentence'}}, pConfig);
    } catch (err) {
      this.unloadChat(err as string);
      return;
    }
    this.addMessage?.({html: '<div class="deep-chat-update-message">Model loaded</div>', sendUpdate: false});
    this._isModelLoaded = true;
    this._isModelLoading = false;
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
      this.unloadChat(err as string);
    }
  }

  private async immediateResp(messages: Messages, text: string, chat: WebLLM.ChatInterface) {
    const output = await chat.generate(text, undefined, 0); // anything but 1 will not stream
    messages.addNewMessage({text: output});
    this.completionsHandlers.onFinish();
  }

  private static callbackUpdateResponse(messages: Messages, _: number, msg: string) {
    if (!messages.isStreaming()) messages.addNewStreamedMessage();
    messages.updatedStreamedMessage({text: msg, streamOverwrite: true});
  }

  private async streamResp(messages: Messages, text: string, chat: WebLLM.ChatInterface) {
    this.streamHandlers.abortStream.abort = () => {
      chat.interruptGenerate();
    };
    this.streamHandlers.onOpen();
    await chat.generate(text, WebModel.callbackUpdateResponse.bind(this, messages));
    if (!messages.isStreaming()) messages.addNewStreamedMessage(); // needed when early abort clicked
    messages.finaliseStreamedMessage();
    this.streamHandlers.onClose();
  }

  private canSubmit(text?: string) {
    if (!text?.trim() || this._isModelLoading) return false;
    if (this._loadOnFirstMessage) return true;
    return !!this._isModelLoaded;
  }

  override async callServiceAPI(messages: Messages, pMessages: MessageContentI[]) {
    if (!this._isModelLoaded) {
      if (this._loadOnFirstMessage) {
        await this.init();
      } else {
        return;
      }
    }
    if (!WebModel.chat || this._isModelLoading) return;
    messages.addLoadingMessage();
    this.generateResp(messages, pMessages, WebModel.chat);
  }

  private async unloadChat(err: string) {
    this.addMessage?.({error: WebModel.GENERIC_ERROR, sendUpdate: false});
    console.error(err);
    this._isModelLoaded = false;
    this._isModelLoading = false;
    if (!WebModel.chat) return;
    await WebModel.chat.unload();
    WebModel.chat = undefined;
  }

  override isWebModel() {
    return true;
  }
}
