import {DirectConnection} from '../../types/directConnection';
import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {Response as ResponseI} from '../../types/response';
import {DirectServiceIO} from '../utils/directServiceIO';
import {
  uploadFilesToDify,
  parseDifyBlockingResponse,
  parseDifyStreamingResponse,
  DIFY_BUILD_HEADERS,
  DIFY_BUILD_KEY_VERIFICATION_DETAILS,
  preprocessBody,
} from './utils/difyUtils';
import {DifyBlockingResponse, DifyChat, DifyFileInput, DifyResponseMode} from '../../types/dify';
import {DeepChat} from '../../deepChat';
import {APIKey} from '../../types/APIKey';
import {OBJECT} from '../utils/serviceConstants';
import {ERROR} from '../../utils/consts/messageConstants';

export class DifyIO extends DirectServiceIO {
  override insertKeyPlaceholderText = 'Dify API Key';
  override keyHelpUrl = 'https://docs.dify.ai/en/use-dify/publish/developing-with-apis';

  url: string;
  private conversationId = '';
  private user = 'deep-chat-user';
  private inputs: Record<string, unknown> = {};
  private readonly uploadUrl: string;
  private readonly mode: DifyResponseMode;

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = JSON.parse(JSON.stringify(deepChat.directConnection)) as DirectConnection;
    const difyConfig = directConnectionCopy?.dify;

    const apiKey = difyConfig;

    const providedUrl = deepChat.connect?.url;
    const baseUrl = providedUrl
      ? providedUrl.replace(/\/chat-messages\/?$/, '').replace(/\/$/, '')
      : 'https://api.dify.ai/v1';

    super(deepChat, DIFY_BUILD_KEY_VERIFICATION_DETAILS(baseUrl), DIFY_BUILD_HEADERS, apiKey);

    this.url = `${baseUrl}/chat-messages`;
    this.uploadUrl = `${baseUrl}/files/upload`;

    const config = difyConfig as DifyChat;
    if (typeof config === OBJECT) {
      this.completeConfig(config);
    }

    this.mode = this.stream ? DifyResponseMode.STREAMING : DifyResponseMode.BLOCKING;
    this.maxMessages ??= -1;
  }

  override async callServiceAPI(messages: Messages, pMessages: MessageContentI[], files?: File[]) {
    this.messages = messages;
    let difyFiles: DifyFileInput[] = [];

    if (files && files.length > 0) {
      try {
        difyFiles = await uploadFilesToDify(files, {
          url: this.uploadUrl,
          user: this.user,
          headers: this.connectSettings.headers as Record<string, string>,
        });
      } catch (e) {
        console[ERROR]('Dify file upload error:');
        console[ERROR](e);
        throw new Error('Failed to upload files to Dify.');
      }
    }

    this.callDirectServiceServiceAPI(messages, pMessages, (_: object, msgs: MessageContentI[]) =>
      preprocessBody({
        msgs,
        files: difyFiles,
        conversationId: this.conversationId,
        user: this.user,
        inputs: this.inputs,
        mode: this.mode,
      })
    );
  }

  override async extractResultData(result: DifyBlockingResponse | Blob): Promise<ResponseI> {
    const updateConversationId = (id: string) => {
      this.conversationId = id;
    };

    if (this.mode === DifyResponseMode.BLOCKING && !this.stream) {
      return parseDifyBlockingResponse(result as DifyBlockingResponse, updateConversationId);
    }

    return parseDifyStreamingResponse(result as Blob, updateConversationId);
  }

  override completeConfig(config: DifyChat & APIKey) {
    super.completeConfig(config);

    if (config.user) this.user = config.user;
    if (config.inputs) this.inputs = config.inputs;
  }
}
