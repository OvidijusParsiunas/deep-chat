import {CohereChatResult, CohereStreamEventBody} from '../../types/cohereResult';
import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {Legacy} from '../../utils/legacy/legacy';
import {Stream} from '../../utils/HTTP/stream';
import {Response} from '../../types/response';
import {Cohere} from '../../types/cohere';
import {APIKey} from '../../types/APIKey';
import {DeepChat} from '../../deepChat';
import {CohereIO} from './cohereIO';

export class CohereChatIO extends CohereIO {
  constructor(deepChat: DeepChat) {
    const directConnectionCopy = JSON.parse(JSON.stringify(deepChat.directConnection));
    const config = directConnectionCopy.cohere;
    super(deepChat, 'https://api.cohere.com/v2/chat', 'Ask me anything!', {}, config);
    if (typeof config === 'object') {
      const canSendMessage = Legacy.processCohere(config);
      this.canSendMessage = () => canSendMessage;
      this.cleanConfig(config);
      Object.assign(this.rawBody, config);
    }
    this.maxMessages ??= -1;
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
    bodyCopy.model = bodyCopy.model || 'command-a-03-2025';
    return bodyCopy;
  }

  override async callServiceAPI(messages: Messages, pMessages: MessageContentI[]) {
    if (!this.connectSettings) throw new Error('Request settings have not been set up');
    const body = this.preprocessBody(this.rawBody, pMessages);
    const stream = this.stream;
    if ((stream && (typeof stream !== 'object' || !stream.simulation)) || body.stream) {
      body.stream = true;
      this.stream = {readable: true};
      Stream.request(this, body, messages);
    } else {
      HTTPRequest.request(this, body, messages);
    }
  }

  override async extractResultData(result: CohereChatResult): Promise<Response> {
    if (typeof result.message === 'string') throw result.message;

    // Handle streaming events
    if (this.stream && result.text) {
      const bundledEvents = CohereChatIO.parseBundledEvents(result.text);
      const text = CohereChatIO.aggregateBundledEventsText(bundledEvents);
      return {text};
    }

    // Handle non-streaming response (final response)
    if ('message' in result && result.message?.content?.[0]?.text) {
      return {text: result.message.content[0].text};
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
