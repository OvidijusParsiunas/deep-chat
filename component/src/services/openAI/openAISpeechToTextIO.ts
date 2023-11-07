import {OpenAI, OpenAISpeechToText} from '../../types/openAI';
import {Messages} from '../../views/chat/messages/messages';
import {RequestUtils} from '../../utils/HTTP/requestUtils';
import {OpenAIAudioResult} from '../../types/openAIResult';
import {DirectServiceIO} from '../utils/directServiceIO';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {MessageContent} from '../../types/messages';
import {OpenAIUtils} from './utils/openAIUtils';
import {Response} from '../../types/response';
import {DeepChat} from '../../deepChat';

export class OpenAISpeechToTextIO extends DirectServiceIO {
  override insertKeyPlaceholderText = 'OpenAI API Key';
  override getKeyLink = 'https://platform.openai.com/account/api-keys';
  private static readonly AUDIO_TRANSCRIPTIONS_URL = 'https://api.openai.com/v1/audio/transcriptions';
  private static readonly AUDIO_TRANSLATIONS_URL = 'https://api.openai.com/v1/audio/translations';
  private static readonly DEFAULT_MODEL = 'whisper-1';

  introPanelMarkUp = `
    <div style="width: 100%; text-align: center; margin-left: -10px"><b>OpenAI : Speech To Text</b></div>
    <p><b>Upload an audio file</b> to transcribe it into text. You can optionally provide text to guide the audio
      processing.
    <p>Click <a href="https://platform.openai.com/docs/guides/speech-to-text">here</a> for more info.</p>`;

  url = ''; // set dynamically
  permittedErrorPrefixes = ['Invalid'];
  private readonly _maxCharLength: number = OpenAIUtils.FILE_MAX_CHAR_LENGTH;
  private _service_url: string = OpenAISpeechToTextIO.AUDIO_TRANSCRIPTIONS_URL;

  constructor(deepChat: DeepChat) {
    const {textInput} = deepChat;
    const directConnectionCopy = JSON.parse(JSON.stringify(deepChat.directConnection));
    const apiKey = directConnectionCopy?.openAI;
    super(deepChat, OpenAIUtils.buildKeyVerificationDetails(), OpenAIUtils.buildHeaders, apiKey, {audio: {}});
    if (textInput?.characterLimit) this._maxCharLength = textInput.characterLimit;
    const config = directConnectionCopy?.openAI?.audio as NonNullable<OpenAI['speechToText']>;
    if (typeof config === 'object') {
      this.processConfig(config);
      OpenAISpeechToTextIO.cleanConfig(config);
      Object.assign(this.rawBody, config);
    }
    this.rawBody.model ??= OpenAISpeechToTextIO.DEFAULT_MODEL;
    this.rawBody.response_format = 'json';
    this.canSendMessage = OpenAISpeechToTextIO.canSendFileMessage;
  }

  private static canSendFileMessage(_?: string, files?: File[]) {
    return !!files?.[0];
  }

  private processConfig(config?: OpenAISpeechToText) {
    if (config?.type && config.type === 'translation') {
      this._service_url = OpenAISpeechToTextIO.AUDIO_TRANSLATIONS_URL;
      delete config.language; // not used for translations
    }
  }

  private static cleanConfig(config: OpenAISpeechToText) {
    delete config.type;
  }

  private static createFormDataBody(body: OpenAISpeechToText, audio: File) {
    const formData = new FormData();
    formData.append('file', audio);
    Object.keys(body).forEach((key) => {
      formData.append(key, String(body[key as keyof OpenAISpeechToText]));
    });
    return formData;
  }

  private preprocessBody(body: OpenAISpeechToText, messages: MessageContent[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body));
    const lastMessage = messages[messages.length - 1]?.text?.trim();
    if (lastMessage && lastMessage !== '') {
      const processedMessage = lastMessage.substring(0, this._maxCharLength);
      bodyCopy.prompt = processedMessage;
    }
    return bodyCopy;
  }

  // prettier-ignore
  override async callServiceAPI(messages: Messages, pMessages: MessageContent[], files?: File[]) {
    if (!this.requestSettings?.headers) throw new Error('Request settings have not been set up');
    if (!files?.[0]) throw new Error('No file was added');
    this.url = this.requestSettings.url || this._service_url;
    const body = this.preprocessBody(this.rawBody, pMessages);
    const formData = OpenAISpeechToTextIO.createFormDataBody(body, files[0]);
    // need to pass stringifyBody boolean separately as binding is throwing an error for some reason
    RequestUtils.temporarilyRemoveHeader(this.requestSettings,
      HTTPRequest.request.bind(this, this, formData, messages), false);
  }

  override async extractResultData(result: OpenAIAudioResult): Promise<Response> {
    if (result.error) throw result.error.message;
    return {text: result.text};
  }
}
