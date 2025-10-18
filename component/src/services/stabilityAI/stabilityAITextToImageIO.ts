import {STABILITY_AI_BUILD_HEADERS, STABILITY_AI_BUILD_KEY_VERIFICATION_DETAILS} from './utils/stabilityAIUtils';
import {FILES, IMAGE, SRC, TEXT, TYPE} from '../../utils/consts/messageConstants';
import {StabilityAI, StabilityAITextToImage} from '../../types/stabilityAI';
import {StabilityAITextToImageResult} from '../../types/stabilityAIResult';
import {BASE_64_PREFIX} from '../../utils/element/imageUtils';
import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {MessageFiles} from '../../types/messageFile';
import {StabilityAIIO} from './stabilityAIIO';
import {Response} from '../../types/response';
import {DeepChat} from '../../deepChat';

export class StabilityAITextToImageIO extends StabilityAIIO {
  url = 'https://api.stability.ai/v1/generation/stable-diffusion-v1-6/text-to-image';
  private readonly _imageWeight: number | undefined;
  textInputPlaceholderText = 'Describe an image';

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = JSON.parse(JSON.stringify(deepChat.directConnection));
    const apiKey = directConnectionCopy.stabilityAI;
    super(deepChat, STABILITY_AI_BUILD_KEY_VERIFICATION_DETAILS(), STABILITY_AI_BUILD_HEADERS, apiKey);
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
    const lastMessage = messages[messages.length - 1][TEXT];
    const bodyCopy = JSON.parse(JSON.stringify(body));
    const prompt = {[TEXT]: lastMessage} as {weight?: number};
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
      return {[SRC]: `${BASE_64_PREFIX}${imageData.base64}`, [TYPE]: IMAGE};
    }) as MessageFiles;
    return {[FILES]: files};
  }
}
