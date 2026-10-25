import {MINI_MAX_BUILD_KEY_VERIFICATION_DETAILS, MINI_MAX_BUILD_HEADERS} from './utils/miniMaxUtils';
import {AUDIO, DEEP_COPY, FILES, SRC, TEXT, TYPE} from '../../utils/consts/messageConstants';
import {MiniMaxTextToSpeechRequestBody} from '../../types/miniMaxInternal';
import {MiniMaxTextToSpeechResult} from '../../types/miniMaxResult';
import {DirectConnection} from '../../types/directConnection';
import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {DirectServiceIO} from '../utils/directServiceIO';
import {Response} from '../../types/response';
import {DeepChat} from '../../deepChat';

// https://platform.minimax.io/docs/api-reference/speech-t2a-http
export class MiniMaxTextToSpeechIO extends DirectServiceIO {
  override insertKeyPlaceholderText = this.genereteAPIKeyName('MiniMax');
  override keyHelpUrl = 'https://platform.minimax.io/docs/api-reference/speech-t2a-http';
  url = 'https://api.minimax.io/v1/t2a_v2';
  textInputPlaceholderText = 'Insert text to generate audio';

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = DEEP_COPY(deepChat.directConnection) as DirectConnection;
    const apiKey = directConnectionCopy.miniMax;
    super(deepChat, MINI_MAX_BUILD_KEY_VERIFICATION_DETAILS(), MINI_MAX_BUILD_HEADERS, apiKey);
    const config = typeof apiKey === 'object' ? apiKey.textToSpeech : undefined;
    if (typeof config === 'object') Object.assign(this.rawBody, config);
    this.rawBody.model ??= 'speech-2.8-hd';
    this.rawBody.voice_setting ??= {voice_id: 'English_expressive_narrator'};
    this.rawBody.audio_setting ??= {};
    this.rawBody.audio_setting.format ??= 'mp3';
    this.rawBody.stream = false;
    this.rawBody.output_format = 'url';
  }

  private preprocessBody(body: MiniMaxTextToSpeechRequestBody, pMessages: MessageContentI[]) {
    const bodyCopy = DEEP_COPY(body);
    bodyCopy.text = pMessages[pMessages.length - 1]?.[TEXT] || '';
    return bodyCopy;
  }

  override async callServiceAPI(messages: Messages, pMessages: MessageContentI[]) {
    return this.callDirectServiceServiceAPI(messages, pMessages, this.preprocessBody.bind(this));
  }

  override async extractResultData(result: MiniMaxTextToSpeechResult): Promise<Response> {
    if (result.base_resp?.status_code !== 0) {
      throw new Error(result.base_resp?.status_msg || 'MiniMax speech request failed');
    }
    if (result.data?.status !== 2 || !result.data.audio) {
      throw new Error('MiniMax speech response did not contain completed audio');
    }
    return {[FILES]: [{[SRC]: result.data.audio, [TYPE]: AUDIO}]};
  }
}
