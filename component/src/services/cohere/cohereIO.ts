import {COHERE_BUILD_HEADERS, COHERE_BUILD_KEY_VERIFICATION_DETAILS} from './utils/cohereUtils';
import {CohereChatResult, CohereStreamEventBody} from '../../types/cohereResult';
import {ERROR, TEXT} from '../../utils/consts/messageConstants';
import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {DirectServiceIO} from '../utils/directServiceIO';
import {Legacy} from '../../utils/legacy/legacy';
import {OBJECT} from '../utils/serviceConstants';
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
    super(deepChat, COHERE_BUILD_KEY_VERIFICATION_DETAILS(), COHERE_BUILD_HEADERS, config);
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
    const textMessages = pMessages.filter((message) => message[TEXT]);
    bodyCopy.messages = textMessages.map((message) => ({
      role: DirectServiceIO.getRoleViaAI(message.role),
      content: message[TEXT],
    }));
    return bodyCopy;
  }

  override async callServiceAPI(messages: Messages, pMessages: MessageContentI[]) {
    this.callDirectServiceServiceAPI(messages, pMessages, this.preprocessBody.bind(this), {readable: true});
  }

  override async extractResultData(result: CohereChatResult): Promise<Response> {
    if (typeof result.message === 'string') throw result.message;

    // Handle streaming events
    if (this.stream && result[TEXT]) {
      const bundledEvents = CohereIO.parseBundledEvents(result[TEXT]);
      const text = CohereIO.aggregateBundledEventsText(bundledEvents);
      return {text};
    }

    // Handle non-streaming response (final response)
    if ('message' in result && result.message?.content?.[0]?.[TEXT]) {
      return {[TEXT]: result.message.content[0][TEXT]};
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
          console[ERROR]('Failed to parse line:', line, error);
        }
      }
    }

    return parsedStreamEvents;
  }

  private static aggregateBundledEventsText(bundledEvents: CohereStreamEventBody[]) {
    return bundledEvents
      .filter((obj) => obj.type === 'content-delta' && obj.delta?.message?.content?.[TEXT])
      .map((obj) => obj.delta?.message?.content?.[TEXT])
      .join('');
  }
}
