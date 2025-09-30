import {StabilityAI, StabilityAITextToImage} from '../../types/stabilityAI';
import {StabilityAITextToImageResult} from '../../types/stabilityAIResult';
import {BASE_64_PREFIX} from '../../utils/element/imageUtils';
import {MessageContentI} from '../../types/messagesInternal';
import {TEXT_KEY} from '../../utils/consts/messageConstants';
import {Messages} from '../../views/chat/messages/messages';
import {StabilityAIUtils} from './utils/stabilityAIUtils';
import {MessageFiles} from '../../types/messageFile';
import {StabilityAIIO} from './stabilityAIIO';
import {Response} from '../../types/response';
import {DeepChat} from '../../deepChat';

export class StabilityAITextToImageIO extends StabilityAIIO {
  url = 'https://api.stability.ai/v1/generation/stable-diffusion-v1-6/text-to-image';
  private readonly _imageWeight: number | undefined;
  textInputPlaceholderText = 'Describe an image';
  introPanelMarkUp = `
    <div style="width: 100%; text-align: center; margin-left: -10px"><b>Stability AI: Text to Image</b></div>
    <p>Insert text to generate an image.</p>
    <p>Click <a href="https://platform.stability.ai/" target="_blank">here</a> for more info.</p>`;

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = JSON.parse(JSON.stringify(deepChat.directConnection));
    const apiKey = directConnectionCopy.stabilityAI;
    super(deepChat, StabilityAIUtils.buildKeyVerificationDetails(), StabilityAIUtils.buildHeaders, apiKey);
    const config = directConnectionCopy.stabilityAI?.textToImage as NonNullable<StabilityAI['textToImage']>;
    if (typeof config === 'object') {
      if (config.engine_id) this.url = `https://api.stability.ai/v1/generation/${config.engine_id}/text-to-image`;
      if (config.weight !== undefined && config.weight !== null) this._imageWeight = config.weight;
      StabilityAITextToImageIO.cleanConfig(config);
      Object.assign(this.rawBody, config);
    }
    this.canSendMessage = StabilityAITextToImageIO.canSendTextMessage;
  }

  private static cleanConfig(config: StabilityAITextToImage) {
    delete config.engine_id;
    delete config.weight;
  }

  private static canSendTextMessage(text?: string) {
    return !!(text && text.trim() !== '');
  }

  private preprocessBody(body: StabilityAITextToImage, messages: MessageContentI[]) {
    const lastMessage = messages[messages.length - 1].text;
    const bodyCopy = JSON.parse(JSON.stringify(body));
    const prompt = {[TEXT_KEY]: lastMessage} as {weight?: number};
    if (this._imageWeight) prompt.weight = this._imageWeight;
    bodyCopy.text_prompts = [prompt];
    return bodyCopy;
  }

  override async callServiceAPI(messages: Messages, pMessages: MessageContentI[]) {
    this.callDirectServiceServiceAPI(messages, pMessages, this.preprocessBody.bind(this));
  }

  override async extractResultData(result: StabilityAITextToImageResult): Promise<Response> {
    if (result.message) throw result.message;
    const files = result.artifacts.map((imageData) => {
      return {src: `${BASE_64_PREFIX}${imageData.base64}`, type: 'image'};
    }) as MessageFiles;
    return {files};
  }
}
