import {CompletionsHandlers, FileServiceIO, PollResult, ServiceFileTypes, StreamHandlers} from '../serviceIO';
import {FilesServiceConfig, RecordAudioFilesServiceConfig} from '../../types/fileServiceConfigs';
import {RemarkableConfig} from '../../views/chat/messages/remarkable/remarkableConfig';
import {ValidateMessageBeforeSending} from '../../types/validateMessageBeforeSending';
import {ExistingServiceAudioRecordingConfig} from '../../types/microphone';
import {AudioRecordingFiles} from '../../types/audioRecordingFiles';
import {ServiceCallConfig} from '../../types/requestSettings';
import {FileAttachments} from '../../types/fileAttachments';
import {Messages} from '../../views/chat/messages/messages';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {HuggingFaceModel} from '../../types/huggingFace';
import {MessageContent} from '../../types/messages';
import {GenericButton} from '../../types/button';
import {HuggingFaceIO} from './huggingFaceIO';
import {AiAssistant} from '../../aiAssistant';

export class HuggingFaceAudioIO extends HuggingFaceIO {
  override canSendMessage: ValidateMessageBeforeSending = HuggingFaceAudioIO.canSendFile;
  isTextInputDisabled = true;
  recordAudio?: RecordAudioFilesServiceConfig;
  fileTypes: ServiceFileTypes = {
    audio: {
      files: {
        acceptedFormats: '.4a,.mp3,.webm,.mp4,.mpga,.wav,.mpeg,.m4a',
        maxNumberOfFiles: 1,
      },
    },
  };

  // prettier-ignore
  constructor(aiAssistant: AiAssistant, placeholderText: string, defaultModel: string,
      config: true | (HuggingFaceModel & ServiceCallConfig & FilesServiceConfig & ExistingServiceAudioRecordingConfig),
      key?: string) {
    super(aiAssistant, placeholderText, defaultModel, config, key);
    if (config && typeof config !== 'boolean' && this.fileTypes.audio) {
      HuggingFaceAudioIO.processAudioConfig(this.fileTypes.audio, config.files, config.button);
      if (config.microphone) {
        this.recordAudio = HuggingFaceAudioIO.processRecordAudioConfig(config.microphone);
      }
    }
  }

  private static processAudioConfig(_audio: FileServiceIO, files?: FileAttachments, button?: GenericButton) {
    if (files && _audio.files) {
      if (_audio.files.infoModal) {
        Object.assign(_audio.files.infoModal, files.infoModal);
        const markdown = files.infoModal?.textMarkDown;
        const remarkable = RemarkableConfig.createNew();
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

  private static canSendFile(_: string, files?: File[]) {
    return !!files?.[0];
  }

  override preprocessBody(_: {}, __: MessageContent[], files: File[]) {
    return files[0] as unknown as {inputs: string};
  }

  override callApi(messages: Messages, completionsHandlers: CompletionsHandlers, _: StreamHandlers, files?: File[]) {
    if (!this.requestSettings) throw new Error('Request settings have not been set up');
    if (!files?.[0]) throw new Error('No file was added');
    HTTPRequest.poll(this, files[0], messages, completionsHandlers.onFinish, false);
  }

  async extractPollResultData(_: object): PollResult {
    return {text: ''};
  }
}
