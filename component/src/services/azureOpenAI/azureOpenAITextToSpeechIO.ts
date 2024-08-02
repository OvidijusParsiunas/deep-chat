import {OpenAITextToSpeechResult} from '../../types/openAIResult';
import {DirectConnection} from '../../types/directConnection';
import {OpenAI, OpenAITextToSpeech} from '../../types/openAI';
import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {DirectServiceIO} from '../utils/directServiceIO';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {OpenAIUtils} from './utils/openAIUtils';
import {Response} from '../../types/response';
import {DeepChat} from '../../deepChat';

export class OpenAITextToSpeechIO extends DirectServiceIO {
  override insertKeyPlaceholderText = 'OpenAI API Key';
  override keyHelpUrl = 'https://platform.openai.com/account/api-keys';
  url = 'https://api.openai.com/v1/audio/speech';
  permittedErrorPrefixes = ['Invalid'];
  private static readonly DEFAULT_MODEL = 'tts-1';
  private static readonly DEFAULT_VOIDE = 'alloy';
  textInputPlaceholderText: string;

  introPanelMarkUp = `
    <div style="width: 100%; text-align: center; margin-left: -10px"><b>OpenAI : Text To Speech</b></div>
    <p>Generate an audio file based on your text input.</p>
    <p>Click <a href="https://platform.openai.com/docs/guides/text-to-speech">here</a> for more information.</p>`;

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = JSON.parse(JSON.stringify(deepChat.directConnection)) as DirectConnection;
    const apiKey = directConnectionCopy?.openAI;
    super(deepChat, OpenAIUtils.buildKeyVerificationDetails(), OpenAIUtils.buildHeaders, apiKey);
    const config = directConnectionCopy?.openAI?.textToSpeech as NonNullable<OpenAI['textToSpeech']>;
    if (typeof config === 'object') Object.assign(this.rawBody, config);
    this.rawBody.model ??= OpenAITextToSpeechIO.DEFAULT_MODEL;
    this.rawBody.voice ??= OpenAITextToSpeechIO.DEFAULT_VOIDE;
    this.textInputPlaceholderText = 'Insert text to generate audio';
    this.rawBody.response_format = 'mp3';
  }

  private preprocessBody(body: OpenAITextToSpeech, messages: MessageContentI[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body));
    const lastMessage = messages[messages.length - 1]?.text?.trim();
    if (lastMessage && lastMessage !== '') {
      bodyCopy.input = lastMessage;
    }
    return bodyCopy;
  }

  override async callServiceAPI(messages: Messages, pMessages: MessageContentI[]) {
    if (!this.connectSettings?.headers) throw new Error('Request settings have not been set up');
    this.url = this.connectSettings.url || this.url;
    const body = this.preprocessBody(this.rawBody, pMessages);
    HTTPRequest.request(this, body, messages);
  }

  override async extractResultData(result: OpenAITextToSpeechResult): Promise<Response> {
    if (result instanceof Blob) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(result);
        reader.onload = (event) => {
          resolve({files: [{src: (event.target as FileReader).result as string, type: 'audio'}]});
        };
      });
    }
    if (result.error) throw result.error.message;
    return {error: 'error'}; // this should theoritaclly not get called but here for typescript
  }
}
