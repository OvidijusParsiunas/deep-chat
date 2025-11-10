import {MistralMessage, MistralRequestBody, MistralContentItem} from '../../types/mistralInternal';
import {MISTRAL_BUILD_HEADERS, MISTRAL_BUILD_KEY_VERIFICATION_DETAILS} from './utils/mistralUtils';
import {ERROR, FILE, IMAGE, SRC, TEXT, TYPE} from '../../utils/consts/messageConstants';
import {IMAGE_URL, INVALID_ERROR_PREFIX, OBJECT} from '../utils/serviceConstants';
import {DirectConnection} from '../../types/directConnection';
import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {DirectServiceIO} from '../utils/directServiceIO';
import {MistralResult} from '../../types/mistralResult';
import {MessageFile} from '../../types/messageFile';
import {Response} from '../../types/response';
import {Mistral} from '../../types/mistral';
import {APIKey} from '../../types/APIKey';
import {DeepChat} from '../../deepChat';

// https://docs.mistral.ai/api/
export class MistralIO extends DirectServiceIO {
  override insertKeyPlaceholderText = this.genereteAPIKeyName('Mistral');
  override keyHelpUrl = 'https://console.mistral.ai/api-keys/';
  url = 'https://api.mistral.ai/v1/chat/completions';
  permittedErrorPrefixes = [INVALID_ERROR_PREFIX];

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = JSON.parse(JSON.stringify(deepChat.directConnection)) as DirectConnection;
    const config = directConnectionCopy.mistral as Mistral & APIKey;
    super(deepChat, MISTRAL_BUILD_KEY_VERIFICATION_DETAILS(), MISTRAL_BUILD_HEADERS, config);
    if (typeof config === OBJECT) {
      this.completeConfig(config, deepChat.directConnection?.mistral?.function_handler);
    }
    this.maxMessages ??= -1;
    this.rawBody.model ??= 'mistral-small-latest';
  }

  private static getFileContent(files: MessageFile[]): MistralContentItem[] {
    return files.map((file) => {
      if (file.type === IMAGE) {
        return {[TYPE]: IMAGE_URL, [IMAGE_URL]: file[SRC] || ''};
      }
      return {[TYPE]: TEXT, [TEXT]: `[Unsupported ${FILE} type: ${file.type}]`};
    });
  }

  private preprocessBody(body: MistralRequestBody, pMessages: MessageContentI[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body)) as MistralRequestBody;
    const processedMessages: MistralMessage[] = this.processMessages(pMessages).map((message) => ({
      role: DirectServiceIO.getRoleViaAI(message.role),
      content: DirectServiceIO.getTextWFilesContent(message, MistralIO.getFileContent),
    }));
    this.addSystemMessage(processedMessages);
    bodyCopy.messages = processedMessages;
    return bodyCopy;
  }

  override async callServiceAPI(messages: Messages, pMessages: MessageContentI[]) {
    this.messages ??= messages;
    this.callDirectServiceServiceAPI(messages, pMessages, this.preprocessBody.bind(this), {});
  }

  override async extractResultData(result: MistralResult, prevBody?: Mistral): Promise<Response> {
    if (result.message) throw result.message;
    if (result[ERROR]) throw result[ERROR].message;

    if (result.choices && result.choices.length > 0) {
      const choice = result.choices[0];

      // Handle streaming response
      if (choice.delta) {
        return this.extractStreamResult(choice, prevBody);
      }

      // Handle non-streaming response
      if (choice.message) {
        if (choice.message.tool_calls) {
          return this.handleToolsGeneric(
            {tool_calls: choice.message.tool_calls},
            this.functionHandler,
            this.messages,
            prevBody
          );
        }
        return {[TEXT]: choice.message.content || ''};
      }
    }

    return {[TEXT]: ''};
  }

  private async extractStreamResult(choice: MistralResult['choices'][0], prevBody?: Mistral) {
    const {delta, finish_reason} = choice;
    if (finish_reason === 'tool_calls' && delta?.tool_calls) {
      const tools = {tool_calls: delta.tool_calls};
      // https://docs.mistral.ai/api/#tag/chat/operation/chat_completion_v1_chat_completions_post
      return this.handleToolsGeneric(tools, this.functionHandler, this.messages, prevBody);
    }
    return {[TEXT]: delta?.content || ''};
  }
}
