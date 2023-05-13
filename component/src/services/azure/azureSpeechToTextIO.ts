import {CompletionsHandlers, StreamHandlers} from '../serviceIO';
import {AzureSpeechToTextResult} from '../../types/azureResult';
import {Messages} from '../../views/chat/messages/messages';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {AiAssistant} from '../../aiAssistant';
import {AzureUtils} from './utils/azureUtils';
import {AzureSpeechIO} from './azureSpeechIO';
import {Result} from '../../types/result';
import {Azure} from '../../types/azure';

export class AzureSpeechToTextIO extends AzureSpeechIO {
  private static readonly HELP_LINK =
    // eslint-disable-next-line max-len
    'https://learn.microsoft.com/en-GB/azure/cognitive-services/speech-service/get-started-text-to-speech?tabs=windows%2Cterminal&pivots=programming-language-rest';
  introPanelMarkUp = `
    <div style="width: 100%; text-align: center; margin-left: -10px"><b>Azure Speech To Text</b></div>
    <p><b>Upload a .wav or .ogg audio file</b> to transcribe it into text.
    <p>
      Click <a href="${AzureSpeechToTextIO.HELP_LINK}">here</a> for more info.
    </p>`;

  url = '';
  isTextInputDisabled = true;
  textInputPlaceholderText = 'Upload an audio file';

  constructor(aiAssistant: AiAssistant, key?: string) {
    const {service, validateMessageBeforeSending} = aiAssistant;
    const config = service?.azure?.speechToText as NonNullable<Azure['speechToText']>;
    super(aiAssistant, AzureUtils.buildSpeechToTextHeaders, config, key, 'audio');
    this.canSendMessage = validateMessageBeforeSending || AzureSpeechToTextIO.canFileSendMessage;
    const lang = config.lang || 'en-US';
    // eslint-disable-next-line max-len
    this.url = `https://${config.region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=${lang}&format=detailed`;
    if (this.fileTypes?.audio?.files && !config.files?.acceptedFormats) {
      this.fileTypes.audio.files.acceptedFormats = '.wav,.ogg';
    }
    this.recordAudio = undefined; // recorded audio files do not seem to work - investigate in the future
  }

  private static canFileSendMessage(_: string, files?: File[]) {
    return !!files?.[0];
  }

  override callApi(messages: Messages, completionsHandlers: CompletionsHandlers, _: StreamHandlers, files?: File[]) {
    if (!this.requestSettings?.headers) throw new Error('Request settings have not been set up');
    if (!files?.[0]) throw new Error('No file was added');
    if (this.requestSettings?.headers) {
      this.requestSettings.headers['Content-Type'] = files[0].name.toLocaleLowerCase().endsWith('.wav')
        ? 'audio/wav; codecs=audio/pcm; samplerate=16000'
        : 'audio/ogg; codecs=opus';
    }
    HTTPRequest.request(this, files[0], messages, completionsHandlers.onFinish, false);
  }

  async extractResultData(result: AzureSpeechToTextResult): Promise<Result> {
    if (result.error) throw result.error;
    return {text: result.DisplayText || ''};
  }
}
