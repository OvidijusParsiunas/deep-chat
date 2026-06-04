import {AI, DEEP_COPY, DOCS_BASE_URL, ERROR, ROLE, SERVICE, STRING, TEXT, USER} from '../utils/consts/messageConstants';
import {AppConfig, ChatCompletionMessageParam, MLCEngineConfig, ModelRecord} from '../types/webModel/webLLM/webLLM';
import {MessageStream} from '../views/chat/messages/stream/messageStream';
import {IntroMessage, MessageContent} from '../types/messages';
import {BaseServiceIO} from '../services/utils/baseServiceIO';
import {WebModelIntroMessage} from './webModelIntroMessage';
import {ElementUtils} from '../utils/element/elementUtils';
import * as WebLLM from '../types/webModel/webLLM/webLLM';
import {WebModelConfig} from '../types/webModel/webModel';
import {MessageContentI} from '../types/messagesInternal';
import {Messages} from '../views/chat/messages/messages';
import {RequestUtils} from '../utils/HTTP/requestUtils';
import {ResponseI} from '../types/responseInternal';
// import * as WebLLM2 from 'deep-chat-web-llm';
import {WebModelFiles} from './webModelFiles';
import config from './webModelConfig';
import {DeepChat} from '../deepChat';
import {
  INVALID_STREAM_ARRAY_RESPONSE,
  INVALID_MODEL_RESPONSE,
  INVALID_MODEL_REQUEST,
} from '../utils/errorMessages/errorMessages';

declare global {
  interface Window {
    webLLM: typeof WebLLM;
  }
}

export class WebModel extends BaseServiceIO {
  public static chat?: WebLLM.MLCEngineInterface;
  private static readonly GENERIC_ERROR =
    'Error, please check the ' +
    `[troubleshooting](${DOCS_BASE_URL}webModel#troubleshooting) section of documentation for help.`;
  private static readonly MULTIPLE_MODELS_ERROR = 'Cannot run multiple web models';
  private static readonly WEB_LLM_NOT_FOUND_ERROR = 'WebLLM module not found';
  private static readonly DEFAULT_MODEL = 'Llama-3.2-1B-Instruct-q4f16_1-MLC';
  public static readonly MODULE_SEARCH_LIMIT_S = 5;
  private _isModelLoaded = false;
  private _isModelLoading = false;
  private _loadOnFirstMessage = false;
  private readonly _webModel: WebModelConfig = {};
  permittedErrorPrefixes = [WebModel.MULTIPLE_MODELS_ERROR, WebModel.WEB_LLM_NOT_FOUND_ERROR, WebModel.GENERIC_ERROR];
  // OpenAI-style chat history (prior user/assistant turns); the system instruction is prepended per request
  private readonly _conversationHistory: ChatCompletionMessageParam[] = [];
  private readonly _chatEl?: HTMLElement;
  private _removeIntro?: () => void;
  private _messages?: Messages;

  constructor(deepChat: DeepChat) {
    super(deepChat);
    // window.webLLM = WebLLM2 as unknown as typeof WebLLM;
    if (typeof deepChat.webModel === 'object') this._webModel = deepChat.webModel;
    if (this._webModel.load?.clearCache) WebModel.clearAllCache();
    this.findModelInWindow(deepChat);
    this.canSendMessage = this.canSubmit.bind(this);
    this._chatEl = deepChat.shadowRoot?.children[0] as HTMLElement;
    if (deepChat.history) WebModel.setUpHistory(this._conversationHistory, deepChat.history);
  }

  // need ref of messages object as web model exhibits unique behaviour to manipulate chat
  public setUpMessages(messages: Messages) {
    this._messages = messages;
    this._removeIntro = () => {
      messages.removeIntroductoryMessage();
      this._removeIntro = undefined;
    };
  }

  private static setUpHistory(conversationHistory: ChatCompletionMessageParam[], history: MessageContent[]) {
    history.forEach((message, index) => {
      if (message[ROLE] === USER && message[TEXT]) {
        const nextMessage = history[index + 1];
        if (nextMessage?.[TEXT] && nextMessage[ROLE] !== USER) {
          conversationHistory.push({role: 'user', content: message[TEXT]});
          conversationHistory.push({role: 'assistant', content: nextMessage[TEXT]});
        }
      }
    });
  }

  private findModelInWindow(deepChat: DeepChat, seconds = 0) {
    if (window.webLLM) {
      this.configureInit(this.shouldAddIntroMessage(deepChat.introMessage));
    } else if (seconds > WebModel.MODULE_SEARCH_LIMIT_S) {
      this._messages?.addNewErrorMessage(SERVICE, WebModel.WEB_LLM_NOT_FOUND_ERROR);
      console[ERROR](
        'The deep-chat-web-llm module has not been attached to the window object. ' + 'Please see the following guide:'
      );
      console[ERROR]('https://deepchat.dev/examples/externalModules');
    } else {
      setTimeout(() => this.findModelInWindow(deepChat, seconds + 1), 1000);
    }
  }

  private shouldAddIntroMessage(customIntroMessage?: IntroMessage | IntroMessage[]) {
    return !customIntroMessage && this._webModel && this._webModel.introMessage?.displayed !== false;
  }

  private scrollToTop(timeoutMS?: number) {
    if (this._webModel.introMessage?.autoScroll === false) return;
    setTimeout(() => {
      if (this._messages?.elementRef) ElementUtils.scrollToTop(this._messages?.elementRef);
    }, timeoutMS);
  }

  // prettier-ignore
  public getIntroMessage(customIntroMessage?: IntroMessage) {
    if (!this.shouldAddIntroMessage(customIntroMessage) || !this._chatEl) return;
    const html = WebModelIntroMessage.setUpInitial(
      this.init.bind(this), this._webModel.introMessage, this._chatEl, !!this._webModel.worker);
    this.scrollToTop(1);
    return {[ROLE]: AI, html, sendUpdate: false};
  }

  private async configureInit(wasIntroSet: boolean) {
    const {load} = this._webModel;
    if (load) {
      if (load.onInit) {
        this.init();
        return;
      }
      if (load.onMessage) {
        this._loadOnFirstMessage = true;
        return;
      }
    }
    if (!wasIntroSet) this.init();
  }

  private async init(files?: FileList) {
    this._messages?.removeError();
    const chat = this.attemptToCreateChat();
    if (chat) await this.loadModel(chat, files);
  }

  private attemptToCreateChat() {
    if (WebModel.chat) {
      this._messages?.addNewErrorMessage(SERVICE, WebModel.MULTIPLE_MODELS_ERROR);
      console[ERROR](WebModel.MULTIPLE_MODELS_ERROR);
      return;
    }
    if (this._isModelLoaded || this._isModelLoading) return;
    const {worker} = this._webModel;
    const engineConfig: MLCEngineConfig = {};
    return config.use_web_worker && worker
      ? new window.webLLM.WebWorkerMLCEngine(worker, engineConfig)
      : new window.webLLM.MLCEngine(engineConfig);
  }

  private getConfig() {
    let model = WebModel.DEFAULT_MODEL;
    if (this._webModel.model) model = this._webModel.model;
    // prefer the package's prebuilt model list (auto-updates with deep-chat-web-llm); fall back to
    // the local curated list (webModelConfig.ts) when prebuiltAppConfig is unavailable
    const prebuilt = window.webLLM?.prebuiltAppConfig?.model_list;
    const model_list = DEEP_COPY(prebuilt && prebuilt.length > 0 ? prebuilt : config.model_list) as ModelRecord[];
    // default Cache API backend is required for the export/import feature (see webModelFiles.ts)
    const appConfig: AppConfig = {model_list, cacheBackend: 'cache'};
    if (this._webModel.urls) {
      let modelRecord = model_list.find((record) => record.model_id === model);
      if (!modelRecord) {
        modelRecord = {model: '', model_id: model, model_lib: ''};
        model_list.push(modelRecord);
      }
      if (this._webModel.urls.model) modelRecord.model = this._webModel.urls.model;
      if (this._webModel.urls.wasm) modelRecord.model_lib = this._webModel.urls.wasm;
    }
    return {model, appConfig};
  }

  // system instruction + prior turns + the new user message, in OpenAI message format
  private buildMessages(text: string): ChatCompletionMessageParam[] {
    const messages: ChatCompletionMessageParam[] = [];
    if (this._webModel.instruction) messages.push({role: 'system', content: this._webModel.instruction});
    messages.push(...this._conversationHistory);
    messages.push({role: 'user', content: text});
    return messages;
  }

  // prettier-ignore
  private async loadModel(chat: WebLLM.MLCEngineInterface, files?: FileList) {
    this.scrollToTop();
    WebModel.chat = chat;
    this._isModelLoading = true;
    let isNewMessage = this._webModel.introMessage?.displayed === false;
    const initProgressCallback = (report: WebLLM.InitProgressReport) => {
      this._messages?.addNewMessage({html: `<div>${report[TEXT]}</div>`, overwrite: true, sendUpdate: false});
      if (isNewMessage) {
        setTimeout(() => ElementUtils.scrollToBottom(this._messages!));
        isNewMessage = false;
      }
    };
    chat.setInitProgressCallback(initProgressCallback);
    try {
      const {model, appConfig} = this.getConfig();
      chat.setAppConfig(appConfig);
      if (this._webModel.load?.skipCache) await window.webLLM.deleteModelAllInfoInCache(model, appConfig);
      // seed the cache from previously-exported model files (import), so reload resolves offline
      if (files && files.length > 0) await WebModelFiles.importToCache(files);
      // the system instruction is sent per-request via the OpenAI-style messages array (buildMessages)
      // considered creating functionality to stop/pause loading, but there is
      // no real way to stop a fetch request in the same session
      await chat.reload(model);
    } catch (err) {
      return this.unloadChat(err as string);
    }
    this.deepChat._validationHandler?.();
    if (!this._webModel.introMessage?.removeAfterLoad) {
      const html = WebModelIntroMessage.setUpAfterLoad(
        this._webModel.introMessage, this._chatEl, !!this._webModel.worker);
      this._messages?.addNewMessage({html, overwrite: true, sendUpdate: false});
    } else if (this._webModel.introMessage.displayed === false) {
      this._messages?.removeLastMessage();
    } else {
      this._removeIntro?.();
    }
    this._isModelLoaded = true;
    this._isModelLoading = false;
  }

  private async unloadChat(err: string) {
    this._messages?.addNewErrorMessage(SERVICE, WebModel.GENERIC_ERROR);
    console[ERROR](err);
    this._isModelLoaded = false;
    this._isModelLoading = false;
    if (!WebModel.chat) return;
    await WebModel.chat.unload();
    WebModel.chat = undefined;
  }

  private async immediateResp(messages: Messages, text: string, chat: WebLLM.MLCEngineInterface) {
    const result = await chat.chat.completions.create({messages: this.buildMessages(text), stream: false});
    const replyText = result.choices[0]?.message?.content || '';
    this._conversationHistory.push({role: 'user', content: text}, {role: 'assistant', content: replyText});
    const output = {[TEXT]: replyText};
    const response = await WebModel.processResponse(this.deepChat, messages, output);
    if (response) response.forEach((data) => messages.addNewMessage(data));
    this.completionsHandlers.onFinish();
  }

  private async streamResp(messages: Messages, text: string, chat: WebLLM.MLCEngineInterface) {
    this.streamHandlers.onAbort = () => {
      chat.interruptGenerate();
    };
    this.streamHandlers.onOpen();
    const stream = new MessageStream(messages);
    const chunks = await chat.chat.completions.create({
      messages: this.buildMessages(text),
      stream: true,
      stream_options: {include_usage: false},
    });
    let aggregated = '';
    // note: new web-llm chunks carry deltas (not the cumulative message) - we accumulate them
    for await (const chunk of chunks) {
      const delta = chunk.choices[0]?.delta?.content || '';
      if (!delta) continue;
      aggregated += delta;
      const response = await WebModel.processResponse(this.deepChat, messages, {[TEXT]: aggregated});
      if (response) stream.upsertStreamedMessage({[TEXT]: response[0][TEXT], overwrite: true});
    }
    this._conversationHistory.push({role: 'user', content: text}, {role: 'assistant', content: aggregated});
    stream.finaliseStreamedMessage();
    this.streamHandlers.onClose();
  }

  private async generateRespByType(ms: Messages, text: string, stream: boolean, chat: WebLLM.MLCEngineInterface) {
    try {
      // need await to catch the error
      if (stream) {
        await this.streamResp(ms, text, chat);
      } else {
        await this.immediateResp(ms, text, chat);
      }
    } catch (e) {
      this._messages?.addNewErrorMessage(SERVICE);
      console.log(e);
    }
  }

  private async generateResp(messages: Messages, pMessages: MessageContentI[], chat: WebLLM.MLCEngineInterface) {
    const lastText = pMessages[pMessages.length - 1][TEXT] as string;
    const {body, error} = await RequestUtils.processRequestInterceptor(this.deepChat, {body: {[TEXT]: lastText}});
    const stream = !!this.stream;
    try {
      if (error) {
        RequestUtils.displayError(messages, new Error(error));
        const onFinish = stream ? this.streamHandlers.onClose : this.completionsHandlers.onFinish;
        onFinish();
      } else if (!body || !body[TEXT]) {
        const error = INVALID_MODEL_REQUEST({body}, false);
        console[ERROR](error);
        const onFinish = stream ? this.streamHandlers.onClose : this.completionsHandlers.onFinish;
        RequestUtils.onInterceptorError(messages, error, onFinish);
      } else {
        this.generateRespByType(messages, body[TEXT], !!this.stream, chat);
      }
    } catch (err) {
      this.unloadChat(err as string);
    }
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
    if (this._webModel.introMessage?.removeAfterMessage) this._removeIntro?.();
    messages.addLoadingMessage();
    this.generateResp(messages, pMessages, WebModel.chat);
  }

  private canSubmit(text?: string) {
    if (!text?.trim() || this._isModelLoading) return false;
    if (this._loadOnFirstMessage) return true;
    return !!this._isModelLoaded;
  }

  private static async processResponse(deepChat: DeepChat, messages: Messages, output: ResponseI) {
    const result = (await deepChat.responseInterceptor?.(output)) || output;
    if (deepChat.connect?.stream)
      if (Array.isArray(result) && result.length > 1) {
        console[ERROR](INVALID_STREAM_ARRAY_RESPONSE);
        return;
      }
    const messageDataArr = Array.isArray(result) ? result : [result];
    const errorMessage = messageDataArr.find((message) => typeof message[ERROR] === STRING);
    if (errorMessage) {
      RequestUtils.displayError(messages, new Error(errorMessage[ERROR]));
      return;
    } else {
      const errorMessage = messageDataArr.find((message) => !message || !message[TEXT]);
      if (errorMessage) {
        const error = INVALID_MODEL_RESPONSE(output, !!deepChat.responseInterceptor, result);
        RequestUtils.displayError(messages, new Error(error));
        return;
      }
    }
    return messageDataArr;
  }

  override isWebModel() {
    return true;
  }

  private static clearAllCache() {
    // IMPORTANT - the scopes need to match those used by deep-chat-web-llm (@mlc-ai/web-llm)
    // ArtifactCache: 'webllm/model', 'webllm/wasm' and 'webllm/config'.
    WebModelFiles.CACHE_SCOPES.forEach((scope) => WebModel.clearCache(scope));
  }

  private static clearCache(scope: string) {
    caches.open(scope).then((cache) => {
      cache.keys().then((keys) => {
        keys.forEach((key) => {
          cache.delete(key);
        });
      });
    });
  }
}
