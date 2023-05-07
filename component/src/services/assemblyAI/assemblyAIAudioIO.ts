import {RemarkableConfig} from '../../views/chat/messages/remarkable/remarkableConfig';
import {ValidateMessageBeforeSending} from '../../types/validateMessageBeforeSending';
import {RequestInterceptor, ResponseInterceptor} from '../../types/interceptors';
import {RecordAudioFilesServiceConfig} from '../../types/fileServiceConfigs';
import {ExistingServiceAudioRecordingConfig} from '../../types/microphone';
import {AudioRecordingFiles} from '../../types/audioRecordingFiles';
import {AssemblyAIResult} from '../../types/assemblyAIResult';
import {Messages} from '../../views/chat/messages/messages';
import {RequestSettings} from '../../types/requestSettings';
import {FileAttachments} from '../../types/fileAttachments';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {AssemblyAIUtils} from './utils/assemblyAIUtils';
import {AssemblyAI} from '../../types/assemblyAI';
import {GenericButton} from '../../types/button';
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

export class AssemblyAIAudioIO implements ServiceIO {
  introPanelMarkUp = `
    <div style="width: 100%; text-align: center; margin-left: -10px"><b>AssemblyAI Audio</b></div>
    <p><b>Upload an audio file</b> to transcribe it into text.
    <p>
      Click <a href="https://www.assemblyai.com/docs/Guides/transcribing_an_audio_file#get-started">here</a> for more info.
    </p>`;

  url = ''; // set dynamically
  isTextInputDisabled = true;
  placeholderText = 'Upload an audio file';
  recordAudio?: RecordAudioFilesServiceConfig;
  canSendMessage: ValidateMessageBeforeSending = AssemblyAIAudioIO.canSendMessage;
  permittedErrorPrefixes = new Set('Invalid');
  fileTypes: ServiceFileTypes = {
    audio: {
      files: {
        acceptedFormats: '.4a,.mp3,.webm,.mp4,.mpga,.wav,.mpeg,.m4a',
        maxNumberOfFiles: 1,
      },
    },
  };
  requestSettings: RequestSettings = {};
  private readonly _service_url: string = 'https://api.assemblyai.com/v2/upload';
  requestInterceptor: RequestInterceptor = (details) => details;
  resposeInterceptor: ResponseInterceptor = (result) => result;

  constructor(aiAssistant: AiAssistant, key?: string) {
    const {openAI, validateMessageBeforeSending} = aiAssistant;
    const config = openAI?.audio as AssemblyAI['audio'];
    const requestSettings = (typeof config === 'object' ? config.request : undefined) || {};
    if (key) this.requestSettings = key ? AssemblyAIUtils.buildRequestSettings(key, requestSettings) : requestSettings;
    const remarkable = RemarkableConfig.createNew();
    if (config && typeof config !== 'boolean' && this.fileTypes.audio) {
      AssemblyAIAudioIO.processAudioConfig(this.fileTypes.audio, remarkable, config.files, config.button);
      if (config.requestInterceptor) this.requestInterceptor = config.requestInterceptor;
      if (config.responseInterceptor) this.resposeInterceptor = config.responseInterceptor;
      if (config.microphone) this.recordAudio = AssemblyAIAudioIO.processRecordAudioConfig(config.microphone);
    }
    if (validateMessageBeforeSending) this.canSendMessage = validateMessageBeforeSending;
  }

  private static canSendMessage(text: string, files?: File[]) {
    return text.trim() !== '' || !!files?.[0];
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

  private static processRecordAudioConfig(microphone: ExistingServiceAudioRecordingConfig['microphone']) {
    const recordAudioConfig: RecordAudioFilesServiceConfig & {files: AudioRecordingFiles} = {files: {format: 'mp3'}};
    if (typeof microphone === 'object') {
      recordAudioConfig.button = microphone.styles;
      if (microphone.format) recordAudioConfig.files.format = microphone.format;
      recordAudioConfig.files.maxDurationSeconds = microphone.maxDurationSeconds;
      // recordAudioConfig.files.newFilePrefix = microphone.newFilePrefix; // can implement in the future
    }
    return recordAudioConfig;
  }
  private addKey(onSuccess: (key: string) => void, key: string) {
    this.requestSettings = AssemblyAIUtils.buildRequestSettings(key, this.requestSettings);
    onSuccess(key);
  }

  // prettier-ignore
  verifyKey(inputElement: HTMLInputElement, keyVerificationHandlers: KeyVerificationHandlers) {
    AssemblyAIUtils.verifyKey(inputElement, this.addKey.bind(this, keyVerificationHandlers.onSuccess),
      keyVerificationHandlers.onFail, keyVerificationHandlers.onLoad);
  }

  callApi(messages: Messages, completionsHandlers: CompletionsHandlers, _: StreamHandlers, files?: File[]) {
    if (!this.requestSettings?.headers) throw new Error('Request settings have not been set up');
    if (!files?.[0]) throw new Error('No file was added');
    this.url = this.requestSettings.url || this._service_url;
    HTTPRequest.request(this, files[0], messages, completionsHandlers.onFinish, false);
  }

  async extractResultData(result: AssemblyAIResult): Promise<Result> {
    const apiKey = this.requestSettings.headers?.['Authorization'] as string;
    const pollingResult = await AssemblyAIUtils.poll(apiKey, result.upload_url);
    return {text: pollingResult.text};
  }
}
