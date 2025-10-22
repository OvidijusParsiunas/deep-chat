import {AUTHENTICATION_ERROR_PREFIX, INVALID_REQUEST_ERROR_PREFIX, OBJECT} from '../utils/serviceConstants';
import {TOGETHER_BUILD_HEADERS, TOGETHER_BUILD_KEY_VERIFICATION_DETAILS} from './utils/togetherUtils';
import {AUDIO, FILES, SRC, TEXT, TYPE} from '../../utils/consts/messageConstants';
import {TogetherTextToSpeechRequestBody} from '../../types/togetherInternal';
import {DirectConnection} from '../../types/directConnection';
import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {Response as ResponseI} from '../../types/response';
import {TogetherTextToSpeech} from '../../types/together';
import {DirectServiceIO} from '../utils/directServiceIO';
import {APIKey} from '../../types/APIKey';
import {DeepChat} from '../../deepChat';

// https://docs.together.ai/reference/audio-speech
export class TogetherTextToSpeechIO extends DirectServiceIO {
  override insertKeyPlaceholderText = this.genereteAPIKeyName('Together AI');
  override keyHelpUrl = 'https://api.together.xyz/settings/api-keys';
  url = 'https://api.together.xyz/v1/audio/speech';
  permittedErrorPrefixes = [INVALID_REQUEST_ERROR_PREFIX, AUTHENTICATION_ERROR_PREFIX];

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = JSON.parse(JSON.stringify(deepChat.directConnection)) as DirectConnection;
    const apiKey = directConnectionCopy.together;
    super(deepChat, TOGETHER_BUILD_KEY_VERIFICATION_DETAILS(), TOGETHER_BUILD_HEADERS, apiKey);
    const config = directConnectionCopy.together?.textToSpeech as TogetherTextToSpeech & APIKey;
    if (typeof config === OBJECT) this.completeConfig(config);
    this.rawBody.model ??= 'cartesia/sonic';
    this.rawBody.voice ??= 'laidback woman';
  }

  private preprocessBody(body: TogetherTextToSpeechRequestBody, pMessages: MessageContentI[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body)) as TogetherTextToSpeechRequestBody;
    const lastMessage = pMessages[pMessages.length - 1];
    bodyCopy.input = lastMessage?.[TEXT] || '';
    return bodyCopy;
  }

  override async callServiceAPI(messages: Messages, pMessages: MessageContentI[]) {
    return this.callDirectServiceServiceAPI(messages, pMessages, this.preprocessBody.bind(this));
  }

  override async extractResultData(result: ArrayBuffer): Promise<ResponseI> {
    const blob = new Blob([result], {[TYPE]: 'audio/mpeg'});
    const audioUrl = URL.createObjectURL(blob);
    return {[FILES]: [{[SRC]: audioUrl, [TYPE]: AUDIO}]};
  }
}
