import {AUTHENTICATION_ERROR_PREFIX, AUTHORIZATION_H, IMAGE_URL, OBJECT} from '../utils/serviceConstants';
import {BIG_MODEL_BUILD_KEY_VERIFICATION_DETAILS, BIG_MODEL_BUILD_HEADERS} from './utils/bigModelUtils';
import {BigModelResult, BigModelNormalResult, BigModelStreamEvent} from '../../types/bigModelResult';
import {AI, ERROR, FILE, IMAGE, SRC, TEXT, TYPE} from '../../utils/consts/messageConstants';
import {MessageElements, Messages} from '../../views/chat/messages/messages';
import {DirectConnection} from '../../types/directConnection';
import {MessageContentI} from '../../types/messagesInternal';
import {Response as ResponseI} from '../../types/response';
import {DirectServiceIO} from '../utils/directServiceIO';
import {MessageFile} from '../../types/messageFile';
import {BigModelChat} from '../../types/bigModel';
import {DeepChat} from '../../deepChat';
import {
  BigModelRequestBody,
  BigModelContentItem,
  BigModelUserMessage,
  BigModelMessage,
} from '../../types/bigModelInternal';

// https://docs.bigmodel.cn/api-reference/%E6%A8%A1%E5%9E%8B-api/%E5%AF%B9%E8%AF%9D%E8%A1%A5%E5%85%A8
export class BigModelChatIO extends DirectServiceIO {
  override insertKeyPlaceholderText = this.genereteAPIKeyName('BigModel');
  override keyHelpUrl = 'https://open.bigmodel.cn/usercenter/apikeys';
  url = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
  permittedErrorPrefixes = [AUTHORIZATION_H, AUTHENTICATION_ERROR_PREFIX];

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = JSON.parse(JSON.stringify(deepChat.directConnection)) as DirectConnection;
    const apiKey = directConnectionCopy.bigModel;
    super(deepChat, BIG_MODEL_BUILD_KEY_VERIFICATION_DETAILS(), BIG_MODEL_BUILD_HEADERS, apiKey);
    const config = directConnectionCopy.bigModel?.chat as BigModelChat;
    if (typeof config === OBJECT) {
      this.completeConfig(config, (deepChat.directConnection?.bigModel?.chat as BigModelChat)?.function_handler);
    }
    this.maxMessages ??= -1;
    this.rawBody.model ??= 'glm-4.5';
  }

  private static getFileContent(files: MessageFile[]): BigModelContentItem[] {
    return files.map((file) => {
      if (file.type === IMAGE) {
        return {[TYPE]: IMAGE_URL, [IMAGE_URL]: {url: file[SRC] || ''}};
      }
      return {[TYPE]: FILE, file_url: {url: file[SRC] || ''}};
    });
  }

  private preprocessBody(body: BigModelRequestBody, pMessages: MessageContentI[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body)) as BigModelRequestBody;
    const processedMessages: BigModelMessage[] = this.processMessages(pMessages).map((message) => {
      return {
        content: BigModelChatIO.getTextWFilesContent(message, BigModelChatIO.getFileContent),
        role: DirectServiceIO.getRoleViaAI(message.role),
      } as BigModelUserMessage;
    });
    this.addSystemMessage(processedMessages);
    bodyCopy.messages = processedMessages;
    return bodyCopy;
  }

  override async callServiceAPI(messages: Messages, pMessages: MessageContentI[]) {
    this.messages ??= messages;
    this.callDirectServiceServiceAPI(messages, pMessages, this.preprocessBody.bind(this), {});
  }

  override async extractResultData(result: BigModelResult, prevBody?: BigModelChat): Promise<ResponseI> {
    if (result[ERROR]) throw result[ERROR].message;
    if (result.choices.length > 0) {
      if ((result.choices[0] as BigModelStreamEvent).delta !== undefined) {
        return this.extractStreamResult(result.choices[0] as BigModelStreamEvent, prevBody);
      }
      if ((result.choices[0] as BigModelNormalResult).message !== undefined) {
        const message = (result.choices[0] as BigModelNormalResult).message;
        if (message.tool_calls) {
          return this.handleToolsGeneric({tool_calls: message.tool_calls}, this.functionHandler, this.messages, prevBody);
        }
        return {[TEXT]: message.content};
      }
    }
    return {[TEXT]: ''};
  }

  private async extractStreamResult(choice: BigModelStreamEvent, prevBody?: BigModelChat) {
    const {delta, finish_reason} = choice;
    const lastMessage = this.messages?.messageToElements[this.messages.messageToElements.length - 2];
    // This is used when AI responds first responds with something like "Let me think about this"
    // and then creates a new stream with the actual result. The problem is that the first
    // message can sometimes be completely empty which does not look good in the UI.
    // To repeat this behaviour, ask for something twice in same chat
    if (lastMessage?.[0].role === AI && lastMessage?.[0][TEXT]?.replace(/\n/g, '').trim().length === 0) {
      this.messages?.removeMessage(lastMessage[1][TEXT] as MessageElements);
      this.messages?.messageToElements.splice(this.messages.messageToElements.length - 2, 1);
    }

    if (finish_reason === 'tool_calls') {
      if (delta.tool_calls) {
        const tools = {tool_calls: delta.tool_calls};
        return this.handleToolsGeneric(tools, this.functionHandler, this.messages, prevBody);
      }
      return {[TEXT]: delta?.content || ''};
    }
    return {[TEXT]: delta?.content || ''};
  }
}
