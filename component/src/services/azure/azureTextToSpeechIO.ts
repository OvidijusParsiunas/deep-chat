import {AUDIO, ERROR, FILES, SRC, TEXT, TYPE} from '../../utils/consts/messageConstants';
import {AZURE_BUILD_TEXT_TO_SPEECH_HEADERS} from './utils/azureUtils';
import {Azure, AzureTextToSpeechConfig} from '../../types/azure';
import {AzureTextToSpeechResult} from '../../types/azureResult';
import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {AzureSpeechIO} from './azureSpeechIO';
import {Response} from '../../types/response';
import {DeepChat} from '../../deepChat';

export class AzureTextToSpeechIO extends AzureSpeechIO {
  private static readonly REGION_ERROR_MESSAGE = `${AzureSpeechIO.REGION_ERROR_PREFIX}TextToSpeech)`;
  permittedErrorPrefixes: string[] = [AzureTextToSpeechIO.REGION_ERROR_MESSAGE];
  isTextInputDisabled = false;
  url = '';

  // prettier-ignore
  constructor(deepChat: DeepChat) {
    const config = deepChat.directConnection?.azure?.textToSpeech as NonNullable<Azure['textToSpeech']>;
    const apiKey = deepChat.directConnection?.azure;
    super(deepChat,
      AZURE_BUILD_TEXT_TO_SPEECH_HEADERS.bind({}, config?.outputFormat || 'audio-16khz-128kbitrate-mono-mp3'),
      config.region, apiKey);
    if (!config.region) {
      this.isTextInputDisabled = true;
      this.canSendMessage = () => false;
      setTimeout(() => {
        deepChat.addMessage({[ERROR]: AzureTextToSpeechIO.REGION_ERROR_MESSAGE});
      });
    } else {
      Object.assign(this.rawBody, config);
      this.rawBody.lang ??= 'en-US';
      this.rawBody.name ??= 'en-US-JennyNeural';
      this.rawBody.gender ??= 'Female';
      this.url = `https://${config.region}.tts.speech.microsoft.com/cognitiveservices/v1`;
    }
  }

  preprocessBody(body: AzureTextToSpeechConfig, messages: MessageContentI[]) {
    const mostRecentMessageText = messages[messages.length - 1][TEXT];
    if (!mostRecentMessageText) return;
    return `<speak version='1.0' xml:lang='${body.lang}'>
      <voice xml:lang='${body.lang}' xml:gender='${body.gender}' name='${body.name}'>
        ${mostRecentMessageText}
      </voice>
    </speak>`;
  }

  override async callServiceAPI(messages: Messages, pMessages: MessageContentI[]) {
    this.callDirectServiceServiceAPI(messages, pMessages, this.preprocessBody.bind(this), undefined, false);
  }

  override async extractResultData(result: AzureTextToSpeechResult): Promise<Response> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(result);
      reader.onload = (event) => {
        resolve({[FILES]: [{[SRC]: (event.target as FileReader).result as string, [TYPE]: AUDIO}]});
      };
    });
  }
}
