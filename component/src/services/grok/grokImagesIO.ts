import { BASE_64_PREFIX } from '../../utils/element/imageUtils';
import { MessageContentI } from '../../types/messagesInternal';
import { Messages } from '../../views/chat/messages/messages';
import { DirectServiceIO } from '../utils/directServiceIO';
import { HTTPRequest } from '../../utils/HTTP/HTTPRequest';
import { GrokImageResult } from '../../types/grokResult';
import { MessageFiles } from '../../types/messageFile';
import { Response } from '../../types/response';
import { GrokImages } from '../../types/grok';
import { GrokUtils } from './utils/grokUtils';
import { DeepChat } from '../../deepChat';

export class GrokImagesIO extends DirectServiceIO {
  override insertKeyPlaceholderText = 'Grok API Key';
  override keyHelpUrl = 'https://console.x.ai/team/default/api-keys';
  private static readonly IMAGE_GENERATION_URL = 'https://api.x.ai/v1/images/generations';

  introPanelMarkUp = `
    <div style="width: 100%; text-align: center; margin-left: -10px"><b>Grok Image Generation</b></div>
    <p><b>Insert text</b> to generate an image.</p>
    <p>Click <a target="_blank" href="https://docs.x.ai/docs/api-reference#image-generations" target="_blank">
      here</a> for more info.</p>`;

  url = GrokImagesIO.IMAGE_GENERATION_URL;
  permittedErrorPrefixes = ['invalid_request_error', 'authentication_error'];

  constructor(deepChat: DeepChat) {
    const { directConnection } = deepChat;
    const apiKey = directConnection?.grok;
    super(deepChat, GrokUtils.buildKeyVerificationDetails(), GrokUtils.buildHeaders, apiKey);
    const config = directConnection?.grok?.images as NonNullable<GrokImages>;
    if (typeof config === 'object') Object.assign(this.rawBody, config);
    this.rawBody.model ??= 'grok-2-image';
  }

  private preprocessBody(body: GrokImages, lastMessage?: string) {
    const bodyCopy = JSON.parse(JSON.stringify(body));
    if (lastMessage && lastMessage !== '') bodyCopy.prompt = lastMessage;
    return bodyCopy;
  }

  override async callServiceAPI(messages: Messages, pMessages: MessageContentI[]) {
    if (!this.connectSettings?.headers) throw new Error('Request settings have not been set up');
    const body = this.preprocessBody(this.rawBody, pMessages[pMessages.length - 1].text);
    HTTPRequest.request(this, body, messages);
  }

  override async extractResultData(result: GrokImageResult): Promise<Response> {
    if (result.error) throw result.error.message;
    const files = result.data.map((imageData) => {
      if (imageData.url) return { src: imageData.url, type: 'image' };
      return { src: `${BASE_64_PREFIX}${imageData.b64_json}`, type: 'image' };
    }) as MessageFiles;
    return { files };
  }
}
