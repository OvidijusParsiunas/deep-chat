import {StabilityAI, StabilityAITextToImage} from '../../types/stabilityAI';
import {StabilityAITextToImageResult} from '../../types/stabilityAIResult';
import {CompletionsHandlers, StreamHandlers} from '../serviceIO';
import {BASE_64_PREFIX} from '../../utils/element/imageUtils';
import {Messages} from '../../views/chat/messages/messages';
import {StabilityAIUtils} from './utils/stabilityAIUtils';
import {DirectServiceIO} from '../utils/directServiceIO';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {MessageFiles} from '../../types/messageFile';
import {MessageContent} from '../../types/messages';
import {OpenAIImages} from '../../types/openAI';
import {Result} from '../../types/result';
import {DeepChat} from '../../deepChat';

export class StabilityAITextToImageIO extends DirectServiceIO {
  override insertKeyPlaceholderText = 'Stability AI API Key';
  override getKeyLink = 'https://platform.stability.ai/docs/getting-started/authentication';
  url = 'https://api.stability.ai/v1/generation/stable-diffusion-v1-5/text-to-image';
  permittedErrorPrefixes = ['invalid_'];
  private readonly _imageWeight: number | undefined;

  constructor(deepChat: DeepChat) {
    const {directConnection} = deepChat;
    const apiKey = directConnection?.stabilityAI;
    super(deepChat, StabilityAIUtils.buildKeyVerificationDetails(), StabilityAIUtils.buildHeaders, apiKey);
    const config = directConnection?.openAI?.images as NonNullable<StabilityAI['textToImage']>;
    if (typeof config === 'object') {
      if (config.engineId) this.url = `https://api.stability.ai/v1/generation/${config.engineId}/text-to-image`;
      if (config.weight !== undefined && config.weight !== null) this._imageWeight = config.weight;
      StabilityAITextToImageIO.cleanConfig(config);
      Object.assign(this.rawBody, config);
    }
    this.canSendMessage = StabilityAITextToImageIO.canFileSendMessage;
  }

  private static cleanConfig(config: StabilityAITextToImage) {
    delete config.engineId;
    delete config.weight;
  }

  private static canFileSendMessage(text?: string) {
    return !!(text && text.trim() !== '');
  }

  private preprocessBody(body: OpenAIImages, lastMessage?: string) {
    const bodyCopy = JSON.parse(JSON.stringify(body));
    const prompt = {text: lastMessage} as {weight?: number};
    if (this._imageWeight) prompt.weight = this._imageWeight;
    bodyCopy.text_prompts = [prompt];
    return bodyCopy;
  }

  // prettier-ignore
  override callServiceAPI(messages: Messages, pMessages: MessageContent[],
      completionsHandlers: CompletionsHandlers, _: StreamHandlers) {
    if (!this.requestSettings) throw new Error('Request settings have not been set up');
    const body = this.preprocessBody(this.rawBody, pMessages[pMessages.length - 1].text);
    HTTPRequest.request(this, body, messages, completionsHandlers.onFinish);
  }

  override async extractResultData(result: StabilityAITextToImageResult): Promise<Result> {
    if (result.message) throw result.message;
    const files = result.artifacts.map((imageData) => {
      return {base64: `${BASE_64_PREFIX}${imageData.base64}`, type: 'image'};
    }) as MessageFiles;
    return {files};
  }
}
