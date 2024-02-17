import {AssemblyAIResult} from '../../types/assemblyAIResult';
import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {DirectServiceIO} from '../utils/directServiceIO';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {AssemblyAIUtils} from './utils/assemblyAIUtils';
import {Response} from '../../types/response';
import {DeepChat} from '../../deepChat';

export class AssemblyAIAudioIO extends DirectServiceIO {
  override insertKeyPlaceholderText = 'AssemblyAI API Key';
  override keyHelpUrl = 'https://www.assemblyai.com/app/account';
  introPanelMarkUp = `
    <div style="width: 100%; text-align: center; margin-left: -10px"><b>AssemblyAI Audio</b></div>
    <p><b>Upload an audio file</b> to transcribe it into text.
    <p>
      Click <a href="https://www.assemblyai.com/docs/Guides/transcribing_an_audio_file#get-started">here</a> for more info.
    </p>`;

  url = 'https://api.assemblyai.com/v2/upload';
  isTextInputDisabled = true;
  textInputPlaceholderText = 'Upload an audio file';
  permittedErrorPrefixes = ['Authentication', 'Invalid'];

  constructor(deepChat: DeepChat) {
    const apiKey = deepChat.directConnection?.assemblyAI;
    super(deepChat, AssemblyAIUtils.buildKeyVerificationDetails(), AssemblyAIUtils.buildHeaders, apiKey, {audio: {}});
    this.canSendMessage = AssemblyAIAudioIO.canFileSendMessage;
  }

  private static canFileSendMessage(_?: string, files?: File[]) {
    return !!files?.[0];
  }

  override async callServiceAPI(messages: Messages, _: MessageContentI[], files?: File[]) {
    if (!this.connectSettings?.headers) throw new Error('Request settings have not been set up');
    if (!files?.[0]) throw new Error('No file was added');
    HTTPRequest.request(this, files[0], messages, false);
  }

  override async extractResultData(result: AssemblyAIResult): Promise<Response> {
    if (result.error) throw result.error;
    const key = this.connectSettings?.headers?.['Authorization'] as string;
    const pollingResult = await AssemblyAIUtils.poll(key, result.upload_url);
    return {text: pollingResult.text};
  }
}
