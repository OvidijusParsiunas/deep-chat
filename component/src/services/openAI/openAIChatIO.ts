import {OpenAIConverseBodyInternal, SystemMessageInternal} from '../../types/openAIInternal';
import {OpenAIConverseBaseBody} from './utils/openAIConverseBaseBody';
import {CompletionsHandlers, StreamHandlers} from '../serviceIO';
import {OpenAIConverseResult} from '../../types/openAIResult';
import {MessageLimitUtils} from '../utils/messageLimitUtils';
import {Messages} from '../../views/chat/messages/messages';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {BaseServideIO} from '../utils/baseServiceIO';
import {MessageContent} from '../../types/messages';
import {OpenAIUtils} from './utils/openAIUtils';
import {OpenAIChat} from '../../types/openAI';
import {AiAssistant} from '../../aiAssistant';
import {Result} from '../../types/result';

// chat is a form of completions
export class OpenAIChatIO extends BaseServideIO {
  override insertKeyPlaceholderText = 'OpenAI API Key';
  override getKeyLink = 'https://platform.openai.com/account/api-keys';
  url = 'https://api.openai.com/v1/chat/completions';
  override readonly raw_body: OpenAIConverseBodyInternal;
  private readonly _systemMessage: SystemMessageInternal =
    OpenAIChatIO.generateSystemMessage('You are a helpful assistant.');

  constructor(aiAssistant: AiAssistant) {
    const config = aiAssistant.service?.openAI?.chat; // can be undefined as this is the default service
    super(aiAssistant, OpenAIUtils.buildKeyVerificationDetails(), OpenAIUtils.buildHeaders, config);
    if (typeof config === 'object') {
      if (config.systemPrompt) this._systemMessage = OpenAIChatIO.generateSystemMessage(config.systemPrompt);
      this.cleanConfig(config);
    }
    this.raw_body = OpenAIConverseBaseBody.build(OpenAIConverseBaseBody.GPT_CHAT_TURBO_MODEL, config);
  }

  public static generateSystemMessage(systemPrompt: string): SystemMessageInternal {
    return {role: 'system', content: systemPrompt};
  }

  private cleanConfig(config: OpenAIChat) {
    delete config.systemPrompt;
  }

  // prettier-ignore
  private preprocessBody(body: OpenAIConverseBodyInternal, messages: MessageContent[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body));
    const totalMessagesMaxCharLength = this.totalMessagesMaxCharLength || OpenAIUtils.CONVERSE_MAX_CHAR_LENGTH;
    const processedMessages = MessageLimitUtils.processMessages(messages, this._systemMessage.content.length,
      this.maxMessages, totalMessagesMaxCharLength
      ).map((message) => ({content: message.text, role: message.role === 'ai' ? 'assistant' : 'user'}));
    bodyCopy.messages = [this._systemMessage, ...processedMessages];
    return bodyCopy;
  }

  // prettier-ignore
  override callServiceAPI(messages: Messages, _: MessageContent[],
      completionsHandlers: CompletionsHandlers, streamHandlers: StreamHandlers) {
    if (!this.requestSettings) throw new Error('Request settings have not been set up');
    const body = this.preprocessBody(this.raw_body, messages.messages);
    if (body.stream) {
      HTTPRequest.requestStream(this, body, messages,
        streamHandlers.onOpen, streamHandlers.onClose, streamHandlers.abortStream);
    } else {
      HTTPRequest.request(this, body, messages, completionsHandlers.onFinish);
    }
  }

  async extractResultData(result: OpenAIConverseResult): Promise<Result> {
    if (result.error) throw result.error.message;
    if (result.choices[0].delta) {
      return {text: result.choices[0].delta.content || ''};
    }
    if (result.choices[0].message) {
      return {text: result.choices[0].message.content};
    }
    return {text: ''};
  }
}
