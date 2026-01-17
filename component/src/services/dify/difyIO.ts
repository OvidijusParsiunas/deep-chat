import {DirectConnection} from '../../types/directConnection';
import {KeyVerificationDetails} from '../../types/keyVerificationDetails';
import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {Response as ResponseI} from '../../types/response';
import {DirectServiceIO} from '../utils/directServiceIO';
import {uploadFilesToDify} from './utils/difyUtils';
import {DifyBlockingResponse, DifyFileInput, DifyResponseMode, DifyStreamEvent} from '../../types/dify';
import {DeepChat} from '../../deepChat';

export class DifyChatIO extends DirectServiceIO {
  override insertKeyPlaceholderText = 'Dify API Key';
  override keyHelpUrl = 'https://docs.dify.ai/en/use-dify/publish/developing-with-apis';

  url: string;
  private conversationId = '';
  private readonly user: string;
  private readonly inputs: Record<string, unknown>;
  private readonly uploadUrl: string;
  private readonly mode: DifyResponseMode;

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = JSON.parse(JSON.stringify(deepChat.directConnection)) as DirectConnection;
    const difyConfig = directConnectionCopy?.dify;
    const apiKey = difyConfig;
    const baseUrl = difyConfig?.url || 'https://api.dify.ai/v1';

    super(deepChat, DifyChatIO.buildKeyVerificationDetails(baseUrl), DifyChatIO.buildHeaders, apiKey);

    this.url = `${baseUrl}/chat-messages`;
    this.uploadUrl = `${baseUrl}/files/upload`;

    const chatConfig = typeof difyConfig?.chat === 'object' ? difyConfig.chat : {};
    this.user = chatConfig.user || 'deep-chat-user';
    this.inputs = chatConfig.inputs || {};

    this.mode = difyConfig?.mode === DifyResponseMode.STREAMING ? DifyResponseMode.STREAMING : DifyResponseMode.BLOCKING;

    this.maxMessages = -1;
    this.stream = this.mode === DifyResponseMode.STREAMING;
  }

  private static buildKeyVerificationDetails(baseUrl: string): KeyVerificationDetails {
    return {
      url: `${baseUrl}/parameters`,
      method: 'GET',
      handleVerificationResult: (result: object): boolean => {
        return !!result && ('user_input_form' in result || 'opening_statement' in result || 'file_upload' in result);
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
      response_mode: this.mode,
      user: this.user,
      ...(this.conversationId ? {conversation_id: this.conversationId} : {}),
      ...(files && files.length > 0 ? {files} : {}),
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

  override async extractResultData(result: DifyBlockingResponse | Blob): Promise<ResponseI> {
    if (this.mode === DifyResponseMode.BLOCKING && !this.stream) {
      return this.processBlockingResponse(result as DifyBlockingResponse);
    }
    return this.processStreamingResponse(result as Blob);
  }

  private processBlockingResponse(result: DifyBlockingResponse): ResponseI {
    if (result.conversation_id) {
      this.conversationId = result.conversation_id;
    }
    return {text: result.answer || ''};
  }

  /**
   * Process streaming responses (SSE)
   * The data format returned by Dify is "data: {...}",
   * with event types including "message", "agent_message", "workflow_finished", etc.
   */
  private async processStreamingResponse(result: Blob): Promise<ResponseI> {
    const text = await result.text();
    const lines = text.split('\n');
    let fullAnswer = '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;

      try {
        const jsonStr = line.slice(6).trim();
        if (!jsonStr) continue;

        const payload = JSON.parse(jsonStr);

        if (payload.conversation_id && !this.conversationId) {
          this.conversationId = payload.conversation_id;
        }

        if (payload.event === DifyStreamEvent.MESSAGE || payload.event === DifyStreamEvent.AGENT_MESSAGE) {
          fullAnswer += payload.answer || '';
        }

        if (payload.event === DifyStreamEvent.WORKFLOW_FINISHED) {
          if (!fullAnswer && payload.data?.outputs?.answer) {
            fullAnswer = payload.data.outputs.answer;
          }
        }

        if (payload.event === DifyStreamEvent.ERROR) {
          console.error('[Dify API Error]', payload);
        }
      } catch (e) {
        console.warn('Error parsing Dify stream line:', line, e);
      }
    }

    return {text: fullAnswer};
  }
}
