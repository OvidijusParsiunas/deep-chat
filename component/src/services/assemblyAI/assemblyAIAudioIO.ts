import {CompletionsHandlers, StreamHandlers} from '../serviceIO';
import {AssemblyAIResult} from '../../types/assemblyAIResult';
import {Messages} from '../../views/chat/messages/messages';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {AssemblyAIUtils} from './utils/assemblyAIUtils';
import {BaseServideIO} from '../utils/baseServiceIO';
import {MessageContent} from '../../types/messages';
import {AiAssistant} from '../../aiAssistant';
import {Result} from '../../types/result';

export class AssemblyAIAudioIO extends BaseServideIO {
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
  permittedErrorPrefixes = new Set('Invalid');

  // prettier-ignore
  constructor(aiAssistant: AiAssistant) {
    const defaultFile = {audio: {}};
    super(
      aiAssistant, AssemblyAIUtils.buildKeyVerificationDetails(), AssemblyAIUtils.buildHeaders, undefined, defaultFile);
    const {validateMessageBeforeSending} = aiAssistant;
    this.canSendMessage = validateMessageBeforeSending || AssemblyAIAudioIO.canFileSendMessage;
  }

  private static canFileSendMessage(_: string, files?: File[]) {
    return !!files?.[0];
  }

  // prettier-ignore
  override callServiceAPI(messages: Messages, _: MessageContent[],
      completionsHandlers: CompletionsHandlers, __: StreamHandlers, files?: File[]) {
    if (!this.requestSettings?.headers) throw new Error('Request settings have not been set up');
    if (!files?.[0]) throw new Error('No file was added');
    HTTPRequest.request(this, files[0], messages, completionsHandlers.onFinish, false);
  }

  async extractResultData(result: AssemblyAIResult): Promise<Result> {
    const key = this.requestSettings?.headers?.['Authorization'] as string;
    const pollingResult = await AssemblyAIUtils.poll(key, result.upload_url);
    return {text: pollingResult.text};
  }
}
