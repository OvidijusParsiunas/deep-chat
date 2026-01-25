import {DifyFileInput, DifyRequestBody, DifyResponseMode} from '../../types/difyInternal';
import {DEEP_COPY, FILES, TEXT, USER} from '../../utils/consts/messageConstants';
import {AUTHENTICATION_ERROR_PREFIX, OBJECT} from '../utils/serviceConstants';
import {DirectConnection} from '../../types/directConnection';
import {MessageContentI} from '../../types/messagesInternal';
import {DifyBlockingResponse} from '../../types/difyResult';
import {Messages} from '../../views/chat/messages/messages';
import {Response as ResponseI} from '../../types/response';
import {DirectServiceIO} from '../utils/directServiceIO';
import {DifyChat} from '../../types/dify';
import {APIKey} from '../../types/APIKey';
import {DeepChat} from '../../deepChat';
import {
  DIFY_BUILD_KEY_VERIFICATION_DETAILS,
  parseStreamingResponse,
  parseBlockingResponse,
  DIFY_BUILD_HEADERS,
  uploadFiles,
} from './utils/difyUtils';

export class DifyIO extends DirectServiceIO {
  override insertKeyPlaceholderText = this.genereteAPIKeyName('Dify');
  override keyHelpUrl = 'https://docs.dify.ai/en/use-dify/publish/developing-with-apis';
  url: string;
  permittedErrorPrefixes = [AUTHENTICATION_ERROR_PREFIX];
  private _conversationId = '';
  private readonly _user: string = USER;
  private readonly _inputs: Record<string, unknown> = {};
  private readonly _uploadUrl: string;
  private readonly _mode: DifyResponseMode;

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = DEEP_COPY(deepChat.directConnection) as DirectConnection;
    const config = directConnectionCopy?.dify as DifyChat & APIKey;
    const baseUrl = deepChat.connect?.url ?? 'https://api.dify.ai/v1';
    super(deepChat, DIFY_BUILD_KEY_VERIFICATION_DETAILS(baseUrl), DIFY_BUILD_HEADERS, config);
    this.url = `${baseUrl}/chat-messages`;
    this._uploadUrl = `${baseUrl}/${FILES}/upload`;
    if (typeof config === OBJECT) {
      if (config[USER]) this._user = config[USER];
      if (config.inputs) this._inputs = config.inputs;
      this.completeConfig(config);
    }
    this.maxMessages ??= -1;
    this._mode = this.stream ? DifyResponseMode.STREAMING : DifyResponseMode.BLOCKING;
  }

  private preprocessBody(_: object, pMessages: MessageContentI[], files: DifyFileInput[]): DifyRequestBody {
    const processedMessages = this.processMessages(pMessages);
    const lastMessage = processedMessages[processedMessages.length - 1];
    const query = lastMessage?.[TEXT] || ' ';

    const body: DifyRequestBody = {inputs: this._inputs, query, response_mode: this._mode, [USER]: this._user};
    if (this._conversationId) body.conversation_id = this._conversationId;
    if (files && files.length > 0) body[FILES] = files;
    return body;
  }

  override async callServiceAPI(messages: Messages, pMessages: MessageContentI[], files?: File[]) {
    this.messages ??= messages;
    let difyFiles: DifyFileInput[] = [];

    if (files && files.length > 0) {
      difyFiles = await uploadFiles(files, {
        url: this._uploadUrl,
        [USER]: this._user,
        headers: this.connectSettings.headers as Record<string, string>,
      });
    }

    this.callDirectServiceServiceAPI(messages, pMessages, (body: object, msgs: MessageContentI[]) =>
      this.preprocessBody(body, msgs, difyFiles)
    );
  }

  override async extractResultData(result: DifyBlockingResponse | Blob): Promise<ResponseI> {
    const updateConversationId = (id: string) => {
      this._conversationId = id;
    };

    if (this._mode === DifyResponseMode.BLOCKING && !this.stream) {
      return parseBlockingResponse(result as DifyBlockingResponse, updateConversationId);
    }

    return parseStreamingResponse(result as Blob, updateConversationId);
  }
}
