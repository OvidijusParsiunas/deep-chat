import {REQUEST_SETTINGS_ERROR, NO_FILE_ADDED_ERROR} from '../../utils/errorMessages/errorMessages';
import {CONTENT_TYPE_H_KEY, UPLOAD_AN_AUDIO_FILE} from '../utils/serviceConstants';
import {ERROR, FILES, TEXT} from '../../utils/consts/messageConstants';
import {AZURE_BUILD_SPEECH_TO_TEXT_HEADERS} from './utils/azureUtils';
import {AzureSpeechToTextResult} from '../../types/azureResult';
import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {AzureSpeechIO} from './azureSpeechIO';
import {Response} from '../../types/response';
import {DeepChat} from '../../deepChat';
import {Azure} from '../../types/azure';

export class AzureSpeechToTextIO extends AzureSpeechIO {
  private static readonly REGION_ERROR_MESSAGE = `${AzureSpeechIO.REGION_ERROR_PREFIX}SpeechToText)`;
  permittedErrorPrefixes: string[] = [AzureSpeechToTextIO.REGION_ERROR_MESSAGE];
  url = '';
  isTextInputDisabled = true;
  textInputPlaceholderText = UPLOAD_AN_AUDIO_FILE;

  constructor(deepChat: DeepChat) {
    const config = deepChat.directConnection?.azure?.speechToText as NonNullable<Azure['speechToText']>;
    const apiKey = deepChat.directConnection?.azure;
    const defaultFile = {audio: {[FILES]: {acceptedFormats: '.wav,.ogg'}}};
    super(deepChat, AZURE_BUILD_SPEECH_TO_TEXT_HEADERS, config.region, apiKey, defaultFile);
    if (!config.region) {
      this.isTextInputDisabled = true;
      this.canSendMessage = () => false;
      setTimeout(() => {
        deepChat.addMessage({[ERROR]: AzureSpeechToTextIO.REGION_ERROR_MESSAGE});
      });
    } else {
      this.canSendMessage = AzureSpeechToTextIO.canFileSendMessage;
      const lang = config.lang || 'en-US';
      // eslint-disable-next-line max-len
      this.url = `https://${config.region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=${lang}&format=detailed`;
      this.recordAudio = undefined; // recorded audio files do not seem to work - investigate in the future
    }
  }

  private static canFileSendMessage(_?: string, files?: File[]) {
    return !!files?.[0];
  }

  override async callServiceAPI(messages: Messages, _: MessageContentI[], files?: File[]) {
    if (!this.connectSettings?.headers) throw new Error(REQUEST_SETTINGS_ERROR);
    if (!files?.[0]) throw new Error(NO_FILE_ADDED_ERROR);
    if (this.connectSettings?.headers) {
      this.connectSettings.headers[CONTENT_TYPE_H_KEY] = files[0].name.toLocaleLowerCase().endsWith('.wav')
        ? 'audio/wav; codecs=audio/pcm; samplerate=16000'
        : 'audio/ogg; codecs=opus';
    }
    HTTPRequest.request(this, files[0], messages, false);
  }

  override async extractResultData(result: AzureSpeechToTextResult): Promise<Response> {
    if (result[ERROR]) throw result[ERROR];
    return {[TEXT]: result.DisplayText || ''};
  }
}
