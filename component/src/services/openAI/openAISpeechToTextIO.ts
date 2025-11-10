import {REQUEST_SETTINGS_ERROR, NO_FILE_ADDED_ERROR} from '../../utils/errorMessages/errorMessages';
import {OPEN_AI_BUILD_HEADERS, OPEN_AI_BUILD_KEY_VERIFICATION_DETAILS} from './utils/openAIUtils';
import {INVALID_ERROR_PREFIX, UPLOAD_AN_AUDIO_FILE} from '../utils/serviceConstants';
import {AUDIO, ERROR, FILE, TEXT} from '../../utils/consts/messageConstants';
import {OPEN_AI_BASE_URL, OPEN_AI_KEY_HELP_URL} from './openAIConsts';
import {OpenAI, OpenAISpeechToText} from '../../types/openAI';
import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {RequestUtils} from '../../utils/HTTP/requestUtils';
import {OpenAIAudioResult} from '../../types/openAIResult';
import {DirectServiceIO} from '../utils/directServiceIO';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {Response} from '../../types/response';
import {DeepChat} from '../../deepChat';

export class OpenAISpeechToTextIO extends DirectServiceIO {
  override insertKeyPlaceholderText = this.genereteAPIKeyName('OpenAI');
  override keyHelpUrl = OPEN_AI_KEY_HELP_URL;
  private static readonly AUDIO_TRANSCRIPTIONS_URL = `${OPEN_AI_BASE_URL}audio/transcriptions`;
  private static readonly AUDIO_TRANSLATIONS_URL = `${OPEN_AI_BASE_URL}audio/translations`;
  private static readonly DEFAULT_MODEL = 'whisper-1';
  url = ''; // set dynamically
  permittedErrorPrefixes = [INVALID_ERROR_PREFIX];
  textInputPlaceholderText = UPLOAD_AN_AUDIO_FILE;
  private _service_url: string = OpenAISpeechToTextIO.AUDIO_TRANSCRIPTIONS_URL;

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = JSON.parse(JSON.stringify(deepChat.directConnection));
    const apiKey = directConnectionCopy?.openAI;
    super(deepChat, OPEN_AI_BUILD_KEY_VERIFICATION_DETAILS(), OPEN_AI_BUILD_HEADERS, apiKey, {audio: {}});
    const config = directConnectionCopy?.openAI?.[AUDIO] as NonNullable<OpenAI['speechToText']>;
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
    formData.append(FILE, audio);
    Object.keys(body).forEach((key) => {
      formData.append(key, String(body[key as keyof OpenAISpeechToText]));
    });
    return formData;
  }

  private preprocessBody(body: OpenAISpeechToText, messages: MessageContentI[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body));
    const lastMessage = messages[messages.length - 1]?.[TEXT]?.trim();
    if (lastMessage && lastMessage !== '') bodyCopy.prompt = lastMessage;
    return bodyCopy;
  }

  // prettier-ignore
  override async callServiceAPI(messages: Messages, pMessages: MessageContentI[], files?: File[]) {
    if (!this.connectSettings?.headers) throw new Error(REQUEST_SETTINGS_ERROR);
    if (!files?.[0]) throw new Error(NO_FILE_ADDED_ERROR);
    this.url = this.connectSettings.url || this._service_url;
    const body = this.preprocessBody(this.rawBody, pMessages);
    const formData = OpenAISpeechToTextIO.createFormDataBody(body, files[0]);
    // need to pass stringifyBody boolean separately as binding is throwing an error for some reason
    RequestUtils.tempRemoveContentHeader(this.connectSettings,
      HTTPRequest.request.bind(this, this, formData, messages), false);
  }

  override async extractResultData(result: OpenAIAudioResult): Promise<Response> {
    if (result[ERROR]) throw result[ERROR].message;
    return {[TEXT]: result[TEXT]};
  }
}
