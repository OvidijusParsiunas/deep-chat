import {AUTHENTICATION, AUTHORIZATION_H, INVALID_ERROR_PREFIX, UPLOAD_AN_AUDIO_FILE} from '../utils/serviceConstants';
import {REQUEST_SETTINGS_ERROR, NO_FILE_ADDED_ERROR} from '../../utils/errorMessages/errorMessages';
import {ERROR, TEXT} from '../../utils/consts/messageConstants';
import {AssemblyAIResult} from '../../types/assemblyAIResult';
import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {DirectServiceIO} from '../utils/directServiceIO';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {Response} from '../../types/response';
import {DeepChat} from '../../deepChat';
import {
  ASSEMBLY_AI_BUILD_KEY_VERIFICATION_DETAILS,
  ASSEMBLY_AI_BUILD_HEADERS,
  ASSEMBLY_AI_POLL,
} from './utils/assemblyAIUtils';

export class AssemblyAIAudioIO extends DirectServiceIO {
  override insertKeyPlaceholderText = this.genereteAPIKeyName('AssemblyAI');
  override keyHelpUrl = 'https://www.assemblyai.com/app/account';
  url = 'https://api.assemblyai.com/v2/upload';
  isTextInputDisabled = true;
  textInputPlaceholderText = UPLOAD_AN_AUDIO_FILE;
  permittedErrorPrefixes = [AUTHENTICATION, INVALID_ERROR_PREFIX];

  constructor(deepChat: DeepChat) {
    const apiKey = deepChat.directConnection?.assemblyAI;
    super(deepChat, ASSEMBLY_AI_BUILD_KEY_VERIFICATION_DETAILS(), ASSEMBLY_AI_BUILD_HEADERS, apiKey, {audio: {}});
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
    if (result[ERROR]) throw result[ERROR];
    const key = this.connectSettings?.headers?.[AUTHORIZATION_H] as string;
    const pollingResult = await ASSEMBLY_AI_POLL(key, result.upload_url);
    return {[TEXT]: pollingResult[TEXT]};
  }
}
