import {Azure, AzureTextToSpeechConfig} from '../../types/azure';
import {AzureTextToSpeechResult} from '../../types/azureResult';
import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {AzureUtils} from './utils/azureUtils';
import {AzureSpeechIO} from './azureSpeechIO';
import {Response} from '../../types/response';
import {DeepChat} from '../../deepChat';

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

  // prettier-ignore
  constructor(deepChat: DeepChat) {
    const config = deepChat.directConnection?.azure?.textToSpeech as NonNullable<Azure['textToSpeech']>;
    const apiKey = deepChat.directConnection?.azure;
    super(deepChat,
      AzureUtils.buildTextToSpeechHeaders.bind({}, config?.outputFormat || 'audio-16khz-128kbitrate-mono-mp3'),
      config.region, apiKey);
    Object.assign(this.rawBody, config);
    this.rawBody.lang ??= 'en-US';
    this.rawBody.name ??= 'en-US-JennyNeural';
    this.rawBody.gender ??= 'Female';
    this.url = `https://${config.region}.tts.speech.microsoft.com/cognitiveservices/v1`;
  }

  preprocessBody(body: AzureTextToSpeechConfig, messages: MessageContentI[]) {
    const mostRecentMessageText = messages[messages.length - 1].text;
    if (!mostRecentMessageText) return;
    return `<speak version='1.0' xml:lang='${body.lang}'>
      <voice xml:lang='${body.lang}' xml:gender='${body.gender}' name='${body.name}'>
        ${mostRecentMessageText}
      </voice>
    </speak>`;
  }

  override async callServiceAPI(messages: Messages, pMessages: MessageContentI[]) {
    if (!this.connectSettings) throw new Error('Request settings have not been set up');
    const body = this.preprocessBody(this.rawBody, pMessages);
    HTTPRequest.request(this, body as unknown as object, messages, false);
  }

  override async extractResultData(result: AzureTextToSpeechResult): Promise<Response> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(result);
      reader.onload = (event) => {
        resolve({files: [{src: (event.target as FileReader).result as string, type: 'audio'}]});
      };
    });
  }
}
