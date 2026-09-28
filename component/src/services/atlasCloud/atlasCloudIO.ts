import {
  AtlasCloudRequestBody,
  AtlasCloudToolCall,
  AtlasCloudMessage,
  AtlasCloudContent,
} from '../../types/atlasCloudInternal';
import {AUDIO, DEEP_COPY, FILES, IMAGES, ROLE, SRC, TEXT, TYPE} from '../../utils/consts/messageConstants';
import {ATLAS_CLOUD_BUILD_KEY_VERIFICATION_DETAILS, ATLAS_CLOUD_BUILD_HEADERS} from './utils/atlasCloudUtils';
import {AtlasCloudAPIResult, AtlasCloudStreamEvent} from '../../types/atlasCloudResult';
import {DirectConnection} from '../../types/directConnection';
import {MessageContentI} from '../../types/messagesInternal';
import {AtlasCloud, AtlasCloudChat} from '../../types/atlasCloud';
import {Messages} from '../../views/chat/messages/messages';
import {Response as ResponseI} from '../../types/response';
import {DirectServiceIO} from '../utils/directServiceIO';
import {MessageFile} from '../../types/messageFile';
import {APIKey} from '../../types/APIKey';
import {DeepChat} from '../../deepChat';
import {INPUT_AUDIO, IMAGE_URL, OBJECT, SYSTEM} from '../utils/serviceConstants';

// https://www.atlascloud.ai/
// Note: unlike the OpenAI-style providers this was modeled on, Atlas Cloud
// reports errors as {code, msg} rather than {error: {message, type}}, so no
// permittedErrorPrefixes list is set here (see extractResultData/atlasCloudUtils) —
// there's no stable message prefix to allowlist, so failures fall back to the
// generic error message instead of leaking raw server text.
export class AtlasCloudIO extends DirectServiceIO {
  override insertKeyPlaceholderText = this.genereteAPIKeyName('Atlas Cloud');
  override keyHelpUrl = 'https://www.atlascloud.ai/';
  url = 'https://api.atlascloud.ai/v1/chat/completions';
  readonly _streamToolCalls?: AtlasCloudToolCall[];

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = DEEP_COPY(deepChat.directConnection) as DirectConnection;
    const config = directConnectionCopy.atlasCloud as AtlasCloud & APIKey;
    super(deepChat, ATLAS_CLOUD_BUILD_KEY_VERIFICATION_DETAILS(), ATLAS_CLOUD_BUILD_HEADERS, config);
    if (typeof config === OBJECT) {
      this.completeConfig(config, (deepChat.directConnection?.atlasCloud as AtlasCloudChat)?.function_handler);
    }
    this.maxMessages ??= -1;
    this.rawBody.model ??= 'openai/gpt-4.1-mini';
    this.rawBody.max_tokens ??= 1000;
  }

  private static getAudioContent(files: MessageFile[]): AtlasCloudContent[] {
    return files
      .filter((file) => file[TYPE] === AUDIO)
      .map((file) => {
        const base64Data = file[SRC]?.split(',')[1];
        const format = file[SRC]?.match(/data:audio\/([^;]+)/)?.[1] as 'wav' | 'mp3';
        return {
          [TYPE]: INPUT_AUDIO as 'input_audio',
          [INPUT_AUDIO]: {
            data: base64Data || '',
            format: format === 'wav' || format === 'mp3' ? format : 'mp3',
          },
        };
      })
      .filter((content) => content[INPUT_AUDIO].data.length > 0);
  }

  private static getContent(message: MessageContentI): string | AtlasCloudContent[] {
    if (message[FILES] && message[FILES].length > 0) {
      const content: AtlasCloudContent[] = [
        ...AtlasCloudIO.getImageContent(message[FILES]),
        ...AtlasCloudIO.getAudioContent(message[FILES]),
      ];
      if (message[TEXT] && message[TEXT].trim().length > 0) {
        content.unshift({[TYPE]: TEXT, [TEXT]: message[TEXT]});
      }
      return content.length > 0 ? content : message[TEXT] || '';
    }
    return message[TEXT] || '';
  }

  private preprocessBody(body: AtlasCloudRequestBody, pMessages: MessageContentI[]) {
    const bodyCopy = DEEP_COPY(body) as AtlasCloudRequestBody;
    const processedMessages = this.processMessages(pMessages).map((message) => {
      return {
        content: AtlasCloudIO.getContent(message),
        [ROLE]: DirectServiceIO.getRoleViaUser(message[ROLE]),
      } as AtlasCloudMessage;
    });

    const messages: AtlasCloudMessage[] = [];
    if (this.systemMessage) messages.push({[ROLE]: SYSTEM, content: this.systemMessage});
    messages.push(...processedMessages);

    bodyCopy.messages = messages;
    return bodyCopy;
  }

  override async callServiceAPI(messages: Messages, pMessages: MessageContentI[]) {
    this.messages ??= messages;
    this.callDirectServiceServiceAPI(messages, pMessages, this.preprocessBody.bind(this), {});
  }

  override async extractResultData(result: AtlasCloudAPIResult, prevBody?: AtlasCloud): Promise<ResponseI> {
    // Atlas Cloud reports errors as {code, msg}, not {error: {message}}
    if ('code' in result && 'msg' in result) throw result.msg;

    // Handle streaming events
    if (result.object === 'chat.completion.chunk') {
      const choice = result.choices?.[0];
      if (choice?.delta) {
        return this.extractStreamResult(choice, prevBody);
      }

      // Handle streaming response with images
      if (result.message?.[IMAGES]) {
        const files = result.message[IMAGES].map((image) => ({
          [SRC]: image[IMAGE_URL].url,
        }));

        return {
          [TEXT]: result.message.content || '',
          [FILES]: files,
        };
      }

      return {[TEXT]: ''};
    }

    // Handle non-streaming response
    if (result.object === 'chat.completion') {
      const choice = result.choices?.[0];
      if (choice?.message) {
        if (choice.message.tool_calls) {
          return this.handleToolsGeneric(
            {tool_calls: choice.message.tool_calls},
            this.functionHandler,
            this.messages,
            prevBody
          );
        }

        const files =
          choice.message[IMAGES]?.map((image) => ({
            [SRC]: image[IMAGE_URL].url,
          })) || [];

        return {
          [TEXT]: choice.message.content || '',
          files,
        };
      }
    }

    return {[TEXT]: ''};
  }

  private async extractStreamResult(choice: AtlasCloudStreamEvent['choices'][0], prevBody?: AtlasCloud) {
    const {delta} = choice;
    // Handle streaming response with images
    if (delta?.[IMAGES]) {
      const files = delta[IMAGES].map((image) => ({
        [SRC]: image[IMAGE_URL].url,
      }));

      return {
        [TEXT]: delta.content || '',
        [FILES]: files,
      };
    }
    return this.extractStreamResultWToolsGeneric(this, choice, this.functionHandler, prevBody);
  }
}
