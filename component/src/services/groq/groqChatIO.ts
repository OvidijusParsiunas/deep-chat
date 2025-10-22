import {GROQ_BUILD_HEADERS, GROQ_BUILD_KEY_VERIFICATION_DETAILS} from './utils/groqUtils';
import {AI, ASSISTANT, ERROR, TEXT} from '../../utils/consts/messageConstants';
import {GroqResult, GroqToolCall, GroqChoice} from '../../types/groqResult';
import {INVALID_ERROR_PREFIX, OBJECT} from '../utils/serviceConstants';
import {GroqMessage, GroqRequestBody} from '../../types/groqInternal';
import {DirectConnection} from '../../types/directConnection';
import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {Response as ResponseI} from '../../types/response';
import {DirectServiceIO} from '../utils/directServiceIO';
import {GroqChat} from '../../types/groq';
import {DeepChat} from '../../deepChat';

// https://console.groq.com/docs/api-reference#chat-create
export class GroqChatIO extends DirectServiceIO {
  override insertKeyPlaceholderText = this.genereteAPIKeyName('Groq');
  override keyHelpUrl = 'https://console.groq.com/keys';
  url = 'https://api.groq.com/openai/v1/chat/completions';
  permittedErrorPrefixes = [INVALID_ERROR_PREFIX, 'property'];
  _streamToolCalls?: GroqToolCall[];

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = JSON.parse(JSON.stringify(deepChat.directConnection)) as DirectConnection;
    const apiKey = directConnectionCopy.groq;
    super(deepChat, GROQ_BUILD_KEY_VERIFICATION_DETAILS(), GROQ_BUILD_HEADERS, apiKey);
    const config = directConnectionCopy.groq?.chat as GroqChat;
    if (typeof config === OBJECT) {
      this.completeConfig(config, (deepChat.directConnection?.groq?.chat as GroqChat)?.function_handler);
    }
    this.maxMessages ??= -1;
    this.rawBody.model ??= 'llama-3.3-70b-versatile';
  }

  private preprocessBody(body: GroqRequestBody, pMessages: MessageContentI[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body)) as GroqRequestBody;
    const processedMessages: GroqMessage[] = this.processMessages(pMessages).map((message) => {
      return {
        content: GroqChatIO.getTextWImagesContent(message),
        role: message.role === AI ? ASSISTANT : (message.role as 'user'),
      };
    });
    this.addSystemMessage(processedMessages);
    bodyCopy.messages = processedMessages;
    return bodyCopy;
  }

  override async callServiceAPI(messages: Messages, pMessages: MessageContentI[]) {
    this.messages ??= messages;
    this.callDirectServiceServiceAPI(messages, pMessages, this.preprocessBody.bind(this), {});
  }

  override async extractResultData(result: GroqResult, prevBody?: GroqRequestBody): Promise<ResponseI> {
    if (result[ERROR]) throw result[ERROR].message;
    if (result.choices?.[0]?.delta) {
      return this.extractStreamResult(result.choices[0], prevBody);
    }
    if (result.choices?.[0]?.message) {
      if (result.choices[0].message.tool_calls) {
        // Only using latest user prompt as for some reason on multiple requests it responds to first
        return this.handleToolsGeneric(result.choices[0].message, this.functionHandler, this.messages, prevBody, {
          message: this.systemMessage,
        });
      }
      return {[TEXT]: result.choices[0].message.content || ''};
    }
    return {[TEXT]: ''};
  }

  // https://console.groq.com/docs/tool-use
  private async extractStreamResult(choice: GroqChoice, prevBody?: GroqRequestBody) {
    return this.extractStreamResultWToolsGeneric(this, choice, this.functionHandler, prevBody);
  }
}
