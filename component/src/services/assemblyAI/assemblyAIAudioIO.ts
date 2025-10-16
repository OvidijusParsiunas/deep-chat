import {AUTHENTICATION, AUTHORIZATION_H, INVALID_ERROR_PREFIX, UPLOAD_AN_AUDIO_FILE} from '../utils/serviceConstants';
import {REQUEST_SETTINGS_ERROR, NO_FILE_ADDED_ERROR} from '../../utils/errorMessages/errorMessages';
import {AssemblyAIResult} from '../../types/assemblyAIResult';
import {MessageContentI} from '../../types/messagesInternal';
import {TEXT_KEY} from '../../utils/consts/messageConstants';
import {Messages} from '../../views/chat/messages/messages';
import {DirectServiceIO} from '../utils/directServiceIO';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {AssemblyAIUtils} from './utils/assemblyAIUtils';
import {Response} from '../../types/response';
import {DeepChat} from '../../deepChat';

export class AssemblyAIAudioIO extends DirectServiceIO {
  override insertKeyPlaceholderText = this.genereteAPIKeyName('AssemblyAI');
  override keyHelpUrl = 'https://www.assemblyai.com/app/account';
  url = 'https://api.assemblyai.com/v2/upload';
  isTextInputDisabled = true;
  textInputPlaceholderText = UPLOAD_AN_AUDIO_FILE;
  permittedErrorPrefixes = [AUTHENTICATION, INVALID_ERROR_PREFIX];

  constructor(deepChat: DeepChat) {
    const apiKey = deepChat.directConnection?.assemblyAI;
    super(deepChat, AssemblyAIUtils.buildKeyVerificationDetails(), AssemblyAIUtils.buildHeaders, apiKey, {audio: {}});
    this.canSendMessage = AssemblyAIAudioIO.canFileSendMessage;
  }

  private static canFileSendMessage(_?: string, files?: File[]) {
    return !!files?.[0];
  }

  override async callServiceAPI(messages: Messages, _: MessageContentI[], files?: File[]) {
    if (!this.connectSettings?.headers) throw new Error(REQUEST_SETTINGS_ERROR);
    if (!files?.[0]) throw new Error(NO_FILE_ADDED_ERROR);
    HTTPRequest.request(this, files[0], messages, false);
  }

  override async extractResultData(result: AssemblyAIResult): Promise<Response> {
    if (result.error) throw result.error;
    const key = this.connectSettings?.headers?.[AUTHORIZATION_H] as string;
    const pollingResult = await AssemblyAIUtils.poll(key, result.upload_url);
    return {[TEXT_KEY]: pollingResult.text};
  }
}
