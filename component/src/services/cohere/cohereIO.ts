import {CohereChatResult, CohereStreamEventBody} from '../../types/cohereResult';
import {MessageContentI} from '../../types/messagesInternal';
import {TEXT_KEY} from '../../utils/consts/messageConstants';
import {Messages} from '../../views/chat/messages/messages';
import {DirectServiceIO} from '../utils/directServiceIO';
import {Legacy} from '../../utils/legacy/legacy';
import {OBJECT} from '../utils/serviceConstants';
import {CohereUtils} from './utils/cohereUtils';
import {Response} from '../../types/response';
import {Cohere} from '../../types/cohere';
import {APIKey} from '../../types/APIKey';
import {DeepChat} from '../../deepChat';

export class CohereIO extends DirectServiceIO {
  override insertKeyPlaceholderText = this.genereteAPIKeyName('Cohere');
  override keyHelpUrl = 'https://dashboard.cohere.ai/api-keys';
  permittedErrorPrefixes = ['invalid'];
  url = 'https://api.cohere.com/v2/chat';

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = JSON.parse(JSON.stringify(deepChat.directConnection));
    const config = directConnectionCopy.cohere;
    super(deepChat, CohereUtils.buildKeyVerificationDetails(), CohereUtils.buildHeaders, config);
    if (typeof config === OBJECT) {
      const canSendMessage = Legacy.processCohere(config);
      this.canSendMessage = () => canSendMessage;
      this.cleanConfig(config);
      Object.assign(this.rawBody, config);
    }
    this.maxMessages ??= -1;
    this.rawBody.model ??= 'command-a-03-2025';
  }

  private cleanConfig(config: Cohere & APIKey) {
    delete config.key;
  }

  private preprocessBody(body: Cohere, pMessages: MessageContentI[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body));
    const textMessages = pMessages.filter((message) => message.text);
    bodyCopy.messages = textMessages.map((message) => ({
      role: message.role === 'ai' ? 'assistant' : 'user',
      content: message.text,
    }));
    return bodyCopy;
  }

  override async callServiceAPI(messages: Messages, pMessages: MessageContentI[]) {
    this.callDirectServiceServiceAPI(messages, pMessages, this.preprocessBody.bind(this), {readable: true});
  }

  override async extractResultData(result: CohereChatResult): Promise<Response> {
    if (typeof result.message === 'string') throw result.message;

    // Handle streaming events
    if (this.stream && result.text) {
      const bundledEvents = CohereIO.parseBundledEvents(result.text);
      const text = CohereIO.aggregateBundledEventsText(bundledEvents);
      return {text};
    }

    // Handle non-streaming response (final response)
    if ('message' in result && result.message?.content?.[0]?.text) {
      return {[TEXT_KEY]: result.message.content[0].text};
    }

    throw new Error('Invalid response format from Cohere API');
  }

  private static parseBundledEvents(bundledEventsStr: string) {
    const lines = bundledEventsStr.trim().split('\n');
    const parsedStreamEvents: CohereStreamEventBody[] = [];

    for (const line of lines) {
      if (line.trim()) {
        // Skip empty lines
        try {
          const parsed = JSON.parse(line);
          parsedStreamEvents.push(parsed);
        } catch (error) {
          console.error('Failed to parse line:', line, error);
        }
      }
    }

    return parsedStreamEvents;
  }

  private static aggregateBundledEventsText(bundledEvents: CohereStreamEventBody[]) {
    return bundledEvents
      .filter((obj) => obj.type === 'content-delta' && obj.delta?.message?.content?.text)
      .map((obj) => obj.delta?.message?.content?.text)
      .join('');
  }
}
