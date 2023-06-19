import {CompletionsHandlers, StreamHandlers} from '../serviceIO';
import {AssemblyAIResult} from '../../types/assemblyAIResult';
import {IExistingServiceIO} from '../utils/existingServiceIO';
import {Messages} from '../../views/chat/messages/messages';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {AssemblyAIUtils} from './utils/assemblyAIUtils';
import {MessageContent} from '../../types/messages';
import {Result} from '../../types/result';
import {DeepChat} from '../../deepChat';

export class AssemblyAIAudioIO extends IExistingServiceIO {
  override insertKeyPlaceholderText = 'AssemblyAI API Key';
  override getKeyLink = 'https://www.assemblyai.com/app/account';
  introPanelMarkUp = `
    <div style="width: 100%; text-align: center; margin-left: -10px"><b>AssemblyAI Audio</b></div>
    <p><b>Upload an audio file</b> to transcribe it into text.
    <p>
      Click <a href="https://www.assemblyai.com/docs/Guides/transcribing_an_audio_file#get-started">here</a> for more info.
    </p>`;

  url = 'https://api.assemblyai.com/v2/upload';
  isTextInputDisabled = true;
  textInputPlaceholderText = 'Upload an audio file';
  permittedErrorPrefixes = ['Invalid'];

  constructor(deepChat: DeepChat) {
    const apiKey = deepChat.existingService?.assemblyAI;
    super(deepChat, AssemblyAIUtils.buildKeyVerificationDetails(), AssemblyAIUtils.buildHeaders, apiKey, {audio: {}});
    const {validateMessageBeforeSending} = deepChat;
    this.canSendMessage = validateMessageBeforeSending || AssemblyAIAudioIO.canFileSendMessage;
  }

  private static canFileSendMessage(_?: string, files?: File[]) {
    return !!files?.[0];
  }

  // prettier-ignore
  override callServiceAPI(messages: Messages, _: MessageContent[],
      completionsHandlers: CompletionsHandlers, __: StreamHandlers, files?: File[]) {
    if (!this.requestSettings?.headers) throw new Error('Request settings have not been set up');
    if (!files?.[0]) throw new Error('No file was added');
    HTTPRequest.request(this, files[0], messages, completionsHandlers.onFinish, false);
  }

  override async extractResultData(result: AssemblyAIResult): Promise<Result> {
    const key = this.requestSettings?.headers?.['Authorization'] as string;
    const pollingResult = await AssemblyAIUtils.poll(key, result.upload_url);
    return {text: pollingResult.text};
  }
}
