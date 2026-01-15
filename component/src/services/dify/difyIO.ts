import {DirectConnection} from '../../types/directConnection';
import {KeyVerificationDetails} from '../../types/keyVerificationDetails';
import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {Response as ResponseI} from '../../types/response';
import {DirectServiceIO} from '../utils/directServiceIO';
import {uploadFilesToDify} from './utils/difyUtils';
import {DifyBlockingResponse, DifyFileInput} from '../../types/dify';
import {DeepChat} from '../../deepChat';

export class DifyChatIO extends DirectServiceIO {
  override insertKeyPlaceholderText = 'Dify API Key';
  override keyHelpUrl = 'https://docs.dify.ai/en/use-dify/publish/developing-with-apis';

  url: string;
  private conversationId = '';
  private readonly user: string;
  private readonly inputs: Record<string, unknown>;
  private readonly uploadUrl: string;

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = JSON.parse(JSON.stringify(deepChat.directConnection)) as DirectConnection;
    const apiKey = directConnectionCopy.dify;
    const config = directConnectionCopy.dify;

    const baseUrl = config?.url || 'https://api.dify.ai/v1';

    super(deepChat, DifyChatIO.buildKeyVerificationDetails(baseUrl), DifyChatIO.buildHeaders, apiKey);

    this.url = `${baseUrl}/chat-messages`;
    this.uploadUrl = `${baseUrl}/files/upload`;
    this.user = (typeof config?.chat === 'object' ? config.chat.user : undefined) || 'deep-chat-user';
    this.inputs = (typeof config?.chat === 'object' ? config.chat.inputs : undefined) || {};

    this.maxMessages = -1;
    this.stream = undefined;
  }

  private static buildKeyVerificationDetails(baseUrl: string): KeyVerificationDetails {
    return {
      url: `${baseUrl}/parameters`,
      method: 'GET',
      handleVerificationResult: (result: object): boolean => {
        return 'user_input_form' in result || 'opening_statement' in result || 'file_upload' in result;
      },
    };
  }

  private static buildHeaders(key: string) {
    return {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    };
  }

  private preprocessBody(_body: object, pMessages: MessageContentI[], files?: DifyFileInput[]) {
    const lastMessage = pMessages[pMessages.length - 1];
    const query = lastMessage?.text || ' ';

    return {
      inputs: this.inputs,
      query,
      response_mode: 'blocking',
      user: this.user,
      ...(this.conversationId && {conversation_id: this.conversationId}),
      ...(files && files.length > 0 && {files}),
    };
  }

  override async callServiceAPI(messages: Messages, pMessages: MessageContentI[], files?: File[]) {
    this.messages = messages;

    let difyFiles: DifyFileInput[] = [];
    if (files && files.length > 0) {
      const headers = this.connectSettings.headers as Record<string, string>;
      difyFiles = await uploadFilesToDify(this.uploadUrl, files, this.user, headers);
    }

    const preprocessWithFiles = (body: object, msgs: MessageContentI[]) => {
      return this.preprocessBody(body, msgs, difyFiles);
    };

    this.callDirectServiceServiceAPI(messages, pMessages, preprocessWithFiles);
  }

  override async extractResultData(result: DifyBlockingResponse): Promise<ResponseI> {
    if (result.conversation_id) {
      this.conversationId = result.conversation_id;
    }

    return {
      text: result.answer || '',
    };
  }
}
