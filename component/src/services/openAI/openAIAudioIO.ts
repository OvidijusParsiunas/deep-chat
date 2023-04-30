import {RemarkableConfig} from '../../views/chat/messages/remarkable/remarkableConfig';
import {ValidateMessageBeforeSending} from '../../types/validateMessageBeforeSending';
import {RequestInterceptor, ResponseInterceptor} from '../../types/interceptors';
import {OpenAI, OpenAIAudioConfig, OpenAIAudioType} from '../../types/openAI';
import {RequestHeaderUtils} from '../../utils/HTTP/RequestHeaderUtils';
import {Microphone, MicrophoneI} from '../../types/microphone';
import {Messages} from '../../views/chat/messages/messages';
import {RequestSettings} from '../../types/requestSettings';
import {FileAttachments} from '../../types/fileAttachments';
import {OpenAIAudioResult} from '../../types/openAIResult';
import {FilesServiceConfig} from '../../types/fileService';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {MessageContent} from '../../types/messages';
import {GenericButton} from '../../types/button';
import {OpenAIUtils} from './utils/openAIUtils';
import {AiAssistant} from '../../aiAssistant';
import {Result} from '../../types/result';
import {Remarkable} from 'remarkable';
import {
  KeyVerificationHandlers,
  CompletionsHandlers,
  ServiceFileTypes,
  StreamHandlers,
  FileServiceIO,
  ServiceIO,
} from '../serviceIO';

export class OpenAIAudioIO implements ServiceIO {
  private static readonly AUDIO_TRANSCRIPTIONS_URL = 'https://api.openai.com/v1/audio/transcriptions';
  private static readonly AUDIO_TRANSLATIONS_URL = 'https://api.openai.com/v1/audio/translations';
  private static readonly DEFAULT_MODEL = 'whisper-1';

  introPanelMarkUp = `
    <div style="width: 100%; text-align: center; margin-left: -10px"><b>OpenAI Audio</b></div>
    <p><b>Upload an audio file</b> to transcribe it into text. You can optionally provide text to guide the audio
      processing.
    <p>Click <a href="https://platform.openai.com/docs/api-reference/audio/create">here</a> for more info.</p>`;

  url = ''; // set dynamically
  microphone?: Microphone;
  canSendMessage: ValidateMessageBeforeSending = OpenAIAudioIO.canSendMessage;
  permittedErrorPrefixes = new Set('Invalid');
  fileTypes: ServiceFileTypes = {
    audio: {
      files: {
        acceptedFormats: '.4a,.mp3,.webm,.mp4,.mpga,.wav,.mpeg,.m4a',
        maxNumberOfFiles: 1,
      },
    },
  };
  private readonly _maxCharLength: number = OpenAIUtils.FILE_MAX_CHAR_LENGTH;
  requestSettings: RequestSettings = {};
  private readonly _raw_body: OpenAIAudioConfig & {response_format?: 'json'} = {};
  private _service_url: string = OpenAIAudioIO.AUDIO_TRANSCRIPTIONS_URL;
  requestInterceptor: RequestInterceptor = (details) => details;
  resposeInterceptor: ResponseInterceptor = (result) => result;

  constructor(aiAssistant: AiAssistant, key?: string) {
    const {openAI, inputCharacterLimit, validateMessageBeforeSending} = aiAssistant;
    if (inputCharacterLimit) this._maxCharLength = inputCharacterLimit;
    const config = openAI?.audio as OpenAI['audio'];
    const requestSettings = (typeof config === 'object' ? config.request : undefined) || {};
    if (key) this.requestSettings = key ? OpenAIUtils.buildRequestSettings(key, requestSettings) : requestSettings;
    const remarkable = RemarkableConfig.createNew();
    if (config && typeof config !== 'boolean' && this.fileTypes.audio) {
      OpenAIAudioIO.processAudioConfig(this.fileTypes.audio, remarkable, config.files, config.button);
      if (config.requestInterceptor) this.requestInterceptor = config.requestInterceptor;
      if (config.responseInterceptor) this.resposeInterceptor = config.responseInterceptor;
      this.microphone = config.microphone;
      this.processConfig(config);
      OpenAIAudioIO.cleanConfig(config);
      this._raw_body = config;
    }
    this._raw_body.model ??= OpenAIAudioIO.DEFAULT_MODEL;
    this._raw_body.response_format = 'json';
    if (validateMessageBeforeSending) this.canSendMessage = validateMessageBeforeSending;
  }

  private static canSendMessage(_: string, files?: File[]) {
    return !!files?.[0];
  }

  private processConfig(config?: OpenAIAudioConfig & OpenAIAudioType) {
    if (config?.type && config.type === 'translations') {
      this._service_url = OpenAIAudioIO.AUDIO_TRANSLATIONS_URL;
      delete config.language; // not used for translations
    }
  }

  // prettier-ignore
  private static processAudioConfig(_audio: FileServiceIO, remarkable: Remarkable, files?: FileAttachments,
      button?: GenericButton) {
    if (files && _audio.files) {
      if (_audio.files.infoModal) {
        Object.assign(_audio.files.infoModal, files.infoModal);
        const markdown = files.infoModal?.textMarkDown;
        _audio.infoModalTextMarkUp = remarkable.render(markdown || '');
      }
      if (files.acceptedFormats) _audio.files.acceptedFormats = files.acceptedFormats;
      if (files.maxNumberOfFiles) _audio.files.maxNumberOfFiles = files.maxNumberOfFiles;
    }
    _audio.button = button;
  }

  private static cleanConfig(config: FilesServiceConfig & OpenAIAudioType & MicrophoneI) {
    delete config.files;
    delete config.button;
    delete config.request;
    delete config.type;
    delete config.microphone;
    delete config.requestInterceptor;
    delete config.responseInterceptor;
  }

  private addKey(onSuccess: (key: string) => void, key: string) {
    this.requestSettings = OpenAIUtils.buildRequestSettings(key, this.requestSettings);
    onSuccess(key);
  }

  // prettier-ignore
  verifyKey(inputElement: HTMLInputElement, keyVerificationHandlers: KeyVerificationHandlers) {
    OpenAIUtils.verifyKey(inputElement, this.addKey.bind(this, keyVerificationHandlers.onSuccess),
      keyVerificationHandlers.onFail, keyVerificationHandlers.onLoad);
  }

  private static createFormDataBody(body: OpenAIAudioConfig, audio: File) {
    const formData = new FormData();
    formData.append('file', audio);
    Object.keys(body).forEach((key) => {
      formData.append(key, String(body[key as keyof OpenAIAudioConfig]));
    });
    return formData;
  }

  private preprocessBody(body: OpenAIAudioConfig, messages: MessageContent[], files: File[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body));
    const lastMessage = messages[messages.length - files.length + 1]?.text?.trim();
    if (lastMessage && lastMessage !== '') {
      const processedMessage = lastMessage.substring(0, this._maxCharLength);
      bodyCopy.prompt = processedMessage;
    }
    return bodyCopy;
  }

  // prettier-ignore
  callApi(messages: Messages, completionsHandlers: CompletionsHandlers, _: StreamHandlers, files?: File[]) {
    if (!this.requestSettings?.headers) throw new Error('Request settings have not been set up');
    if (!files?.[0]) throw new Error('No file was added');
    this.url = this.requestSettings.url || this._service_url;
    const body = this.preprocessBody(this._raw_body, messages.messages, files);
    const formData = OpenAIAudioIO.createFormDataBody(body, files[0]);
    // need to pass stringifyBody boolean separately as binding is throwing an error for some reason
    RequestHeaderUtils.temporarilyRemoveContentType(this.requestSettings,
      HTTPRequest.request.bind(this, this, formData, messages, completionsHandlers.onFinish), false);
  }

  extractResultData(result: OpenAIAudioResult): Result {
    if (result.error) throw result.error.message;
    return {text: result.text};
  }
}
