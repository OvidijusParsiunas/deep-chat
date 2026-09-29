import {GROQ_BUILD_HEADERS, GROQ_BUILD_KEY_VERIFICATION_DETAILS} from './utils/groqUtils';
import {ChatCompletionsToolCall} from '../../types/chatCompletionsInternal';
import {AI, ASSISTANT, DEEP_COPY} from '../../utils/consts/messageConstants';
import {DirectConnection} from '../../types/directConnection';
import {MessageContentI} from '../../types/messagesInternal';
import {INVALID_ERROR_PREFIX} from '../utils/serviceConstants';
import {ChatCompletionsIO} from '../utils/chatCompletionsIO';
import {ChatCompletionsChat} from '../../types/chatCompletions';
import {GroqChat} from '../../types/groq';
import {DeepChat} from '../../deepChat';

// https://console.groq.com/docs/api-reference#chat-create
export class GroqChatIO extends ChatCompletionsIO {
  override insertKeyPlaceholderText = this.genereteAPIKeyName('Groq');
  override keyHelpUrl = 'https://console.groq.com/keys';
  url = 'https://api.groq.com/openai/v1/chat/completions';
  permittedErrorPrefixes = [INVALID_ERROR_PREFIX, 'property'];

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = DEEP_COPY(deepChat.directConnection) as DirectConnection;
    const config = directConnectionCopy.groq?.chat;
    const functionHandler = (deepChat.directConnection?.groq?.chat as GroqChat)?.function_handler;
    // prettier-ignore
    super(deepChat, GROQ_BUILD_KEY_VERIFICATION_DETAILS(), GROQ_BUILD_HEADERS, directConnectionCopy.groq, config,
      functionHandler);
    this.rawBody.model ??= 'llama-3.3-70b-versatile';
  }

  protected override getRole(role: string) {
    return role === AI ? ASSISTANT : role;
  }

  protected override getContent(message: MessageContentI) {
    return ChatCompletionsIO.getTextWImagesContent(message);
  }

  protected override handleTools(tools: {tool_calls?: ChatCompletionsToolCall[]}, prevBody?: ChatCompletionsChat) {
    // Only using latest user prompt as for some reason on multiple requests it responds to first
    return this.handleToolsGeneric(tools, this.functionHandler, this.messages, prevBody, {message: this.systemMessage});
  }
}
