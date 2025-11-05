import {OPEN_AI_BUILD_HEADERS, OPEN_AI_BUILD_KEY_VERIFICATION_DETAILS} from './utils/openAIUtils';
import {AUDIO, ERROR, FILES, SRC, TEXT, TYPE} from '../../utils/consts/messageConstants';
import {INVALID_ERROR_PREFIX, OBJECT} from '../utils/serviceConstants';
import {OPEN_AI_BASE_URL, OPEN_AI_KEY_HELP_URL} from './openAIConsts';
import {OpenAITextToSpeechResult} from '../../types/openAIResult';
import {DirectConnection} from '../../types/directConnection';
import {OpenAI, OpenAITextToSpeech} from '../../types/openAI';
import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {DirectServiceIO} from '../utils/directServiceIO';
import {Response} from '../../types/response';
import {DeepChat} from '../../deepChat';

export class OpenAITextToSpeechIO extends DirectServiceIO {
  override insertKeyPlaceholderText = this.genereteAPIKeyName('OpenAI');
  override keyHelpUrl = OPEN_AI_KEY_HELP_URL;
  url = `${OPEN_AI_BASE_URL}audio/speech`;
  permittedErrorPrefixes = [INVALID_ERROR_PREFIX];
  private static readonly DEFAULT_MODEL = 'tts-1';
  private static readonly DEFAULT_VOIDE = 'alloy';
  textInputPlaceholderText: string;

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = JSON.parse(JSON.stringify(deepChat.directConnection)) as DirectConnection;
    const apiKey = directConnectionCopy?.openAI;
    super(deepChat, OPEN_AI_BUILD_KEY_VERIFICATION_DETAILS(), OPEN_AI_BUILD_HEADERS, apiKey);
    const config = directConnectionCopy?.openAI?.textToSpeech as NonNullable<OpenAI['textToSpeech']>;
    if (typeof config === OBJECT) Object.assign(this.rawBody, config);
    this.rawBody.model ??= OpenAITextToSpeechIO.DEFAULT_MODEL;
    this.rawBody.voice ??= OpenAITextToSpeechIO.DEFAULT_VOIDE;
    this.textInputPlaceholderText = 'Insert text to generate audio';
    this.rawBody.response_format = 'mp3';
  }

  private preprocessBody(body: OpenAITextToSpeech, messages: MessageContentI[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body));
    const lastMessage = messages[messages.length - 1]?.[TEXT]?.trim();
    if (lastMessage && lastMessage !== '') {
      bodyCopy.input = lastMessage;
    }
    return bodyCopy;
  }

  override async callServiceAPI(messages: Messages, pMessages: MessageContentI[]) {
    this.url = this.connectSettings.url || this.url;
    this.callDirectServiceServiceAPI(messages, pMessages, this.preprocessBody.bind(this));
  }

  override async extractResultData(result: OpenAITextToSpeechResult): Promise<Response> {
    if (result instanceof Blob) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(result);
        reader.onload = (event) => {
          resolve({[FILES]: [{[SRC]: (event.target as FileReader).result as string, [TYPE]: AUDIO}]});
        };
      });
    }
    if (result[ERROR]) throw result[ERROR].message;
    return {[ERROR]: ERROR}; // this should theoritaclly not get called but here for typescript
  }
}
