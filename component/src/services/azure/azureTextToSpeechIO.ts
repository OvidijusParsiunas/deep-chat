import {Azure, AzureTextToSpeechConfig} from '../../types/azure';
import {AzureTextToSpeechResult} from '../../types/azureResult';
import {Messages} from '../../views/chat/messages/messages';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {MessageContent} from '../../types/messages';
import {CompletionsHandlers} from '../serviceIO';
import {AiAssistant} from '../../aiAssistant';
import {AzureUtils} from './utils/azureUtils';
import {AzureSpeechIO} from './azureSpeechIO';
import {Result} from '../../types/result';

export class AzureTextToSpeechIO extends AzureSpeechIO {
  private static readonly HELP_LINK =
    // eslint-disable-next-line max-len
    'https://learn.microsoft.com/en-GB/azure/cognitive-services/speech-service/get-started-text-to-speech?tabs=windows%2Cterminal&pivots=programming-language-rest';
  introPanelMarkUp = `
    <div style="width: 100%; text-align: center; margin-left: -10px"><b>Azure Text To Speech</b></div>
    <p>Insert text to synthesize it to audio.
    <p>
      Click <a href="${AzureTextToSpeechIO.HELP_LINK}">here</a> for more info.
    </p>`;

  url = '';
  private readonly _raw_body: AzureTextToSpeechConfig = {};

  // prettier-ignore
  constructor(aiAssistant: AiAssistant) {
    const {service} = aiAssistant;
    const config = service?.azure?.textToSpeech as NonNullable<Azure['textToSpeech']>;
    const defaultFile = {audio: {}};
    super(aiAssistant,
      AzureUtils.buildTextToSpeechHeaders.bind({}, config?.outputFormat || 'audio-16khz-128kbitrate-mono-mp3'),
      config, defaultFile);
    Object.assign(this._raw_body, config);
    this._raw_body.lang ??= 'en-US';
    this._raw_body.gender ??= 'Female';
    this._raw_body.name ??= 'en-US-JennyNeural';
    this.url = `https://${config.region}.tts.speech.microsoft.com/cognitiveservices/v1`;
  }

  preprocessBody(body: AzureTextToSpeechConfig, messages: MessageContent[]) {
    const mostRecentMessageText = messages[messages.length - 1].text;
    if (!mostRecentMessageText) return;
    return `<speak version='1.0' xml:lang='${body.lang}'>
      <voice xml:lang='${body.lang}' xml:gender='${body.gender}' name='${body.name}'>
        ${mostRecentMessageText}
      </voice>
    </speak>`;
  }

  override callApi(messages: Messages, completionsHandlers: CompletionsHandlers) {
    if (!this.requestSettings) throw new Error('Request settings have not been set up');
    const body = this.preprocessBody(this._raw_body, messages.messages);
    HTTPRequest.request(this, body as unknown as object, messages, completionsHandlers.onFinish, false);
  }

  async extractResultData(result: AzureTextToSpeechResult): Promise<Result> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(result);
      reader.onload = (event) => {
        resolve({files: [{base64: (event.target as FileReader).result as string, type: 'audio'}]});
      };
    });
  }
}
