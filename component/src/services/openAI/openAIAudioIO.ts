import {OpenAI, OpenAIAudioConfig, OpenAIAudioType} from '../../types/openAI';
import {ExistingServiceAudioRecordingConfig} from '../../types/microphone';
import {RequestHeaderUtils} from '../../utils/HTTP/RequestHeaderUtils';
import {CompletionsHandlers, StreamHandlers} from '../serviceIO';
import {Messages} from '../../views/chat/messages/messages';
import {OpenAIAudioResult} from '../../types/openAIResult';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {BaseServideIO} from '../utils/baseServiceIO';
import {MessageContent} from '../../types/messages';
import {OpenAIUtils} from './utils/openAIUtils';
import {AiAssistant} from '../../aiAssistant';
import {Result} from '../../types/result';

export class OpenAIAudioIO extends BaseServideIO {
  private static readonly AUDIO_TRANSCRIPTIONS_URL = 'https://api.openai.com/v1/audio/transcriptions';
  private static readonly AUDIO_TRANSLATIONS_URL = 'https://api.openai.com/v1/audio/translations';
  private static readonly DEFAULT_MODEL = 'whisper-1';

  introPanelMarkUp = `
    <div style="width: 100%; text-align: center; margin-left: -10px"><b>OpenAI Audio</b></div>
    <p><b>Upload an audio file</b> to transcribe it into text. You can optionally provide text to guide the audio
      processing.
    <p>Click <a href="https://platform.openai.com/docs/api-reference/audio/create">here</a> for more info.</p>`;

  url = ''; // set dynamically
  permittedErrorPrefixes = new Set('Invalid');
  private readonly _maxCharLength: number = OpenAIUtils.FILE_MAX_CHAR_LENGTH;
  private readonly _raw_body: OpenAIAudioConfig & {response_format?: 'json'} = {};
  private _service_url: string = OpenAIAudioIO.AUDIO_TRANSCRIPTIONS_URL;

  constructor(aiAssistant: AiAssistant, key?: string) {
    const {service, inputCharacterLimit, validateMessageBeforeSending} = aiAssistant;
    const config = service?.openAI?.audio as NonNullable<OpenAI['audio']>;
    super(aiAssistant, OpenAIUtils.buildKeyVerificationDetails(), OpenAIUtils.buildHeaders, config, key, 'audio');
    if (inputCharacterLimit) this._maxCharLength = inputCharacterLimit;
    if (typeof config !== 'boolean') {
      this.processConfig(config);
      OpenAIAudioIO.cleanConfig(config);
      this._raw_body = config;
    }
    this._raw_body.model ??= OpenAIAudioIO.DEFAULT_MODEL;
    this._raw_body.response_format = 'json';
    this.canSendMessage = validateMessageBeforeSending || OpenAIAudioIO.canSendFileMessage;
  }

  private static canSendFileMessage(_: string, files?: File[]) {
    return !!files?.[0];
  }

  private processConfig(config?: OpenAIAudioConfig & OpenAIAudioType) {
    if (config?.type && config.type === 'translations') {
      this._service_url = OpenAIAudioIO.AUDIO_TRANSLATIONS_URL;
      delete config.language; // not used for translations
    }
  }

  private static cleanConfig(config: OpenAIAudioType & ExistingServiceAudioRecordingConfig) {
    delete config.files;
    delete config.button;
    delete config.type;
    delete config.microphone;
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
  override callApi(messages: Messages, completionsHandlers: CompletionsHandlers, _: StreamHandlers, files?: File[]) {
    if (!this.requestSettings?.headers) throw new Error('Request settings have not been set up');
    if (!files?.[0]) throw new Error('No file was added');
    this.url = this.requestSettings.url || this._service_url;
    const body = this.preprocessBody(this._raw_body, messages.messages, files);
    const formData = OpenAIAudioIO.createFormDataBody(body, files[0]);
    // need to pass stringifyBody boolean separately as binding is throwing an error for some reason
    RequestHeaderUtils.temporarilyRemoveContentType(this.requestSettings,
      HTTPRequest.request.bind(this, this, formData, messages, completionsHandlers.onFinish), false);
  }

  async extractResultData(result: OpenAIAudioResult): Promise<Result> {
    if (result.error) throw result.error.message;
    return {text: result.text};
  }
}
