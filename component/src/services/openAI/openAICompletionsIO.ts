import {OpenAICompletionsResult, OpenAICompletionsResultChoice, ToolCalls} from '../../types/openAIResult';
import {AUDIO, ERROR, FILES, SRC, TEXT, TYPE} from '../../utils/consts/messageConstants';
import {OpenAIConverseBodyInternal} from '../../types/openAIInternal';
import {IMAGE_URL, INPUT_AUDIO} from '../utils/serviceConstants';
import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {Response as ResponseI} from '../../types/response';
import {DirectServiceIO} from '../utils/directServiceIO';
import {MessageFile} from '../../types/messageFile';
import {OPEN_AI_BASE_URL} from './openAIConsts';
import {OpenAIChat} from '../../types/openAI';
import {OpenAIBaseIO} from './openAIBaseIO';

type FileContent = {
  type: string;
  image_url?: {url?: string};
  input_audio?: {data?: string; format: string};
  text?: string;
}[];

export class OpenAICompletionsIO extends OpenAIBaseIO {
  // https://platform.openai.com/docs/api-reference/chat/create
  url = `${OPEN_AI_BASE_URL}chat/completions`;
  _streamToolCalls?: ToolCalls;

  private static getFileContent(files: MessageFile[]): FileContent {
    const baseContent = OpenAIBaseIO.getBaseFileContent(files);
    return baseContent.map((file) => {
      if (file.type === INPUT_AUDIO) {
        return file;
      }
      return {[TYPE]: IMAGE_URL, [IMAGE_URL]: {url: (file as MessageFile)[SRC]}};
    }) as FileContent;
  }

  private static getContent(message: MessageContentI) {
    if (message[FILES] && message[FILES].length > 0) {
      const content: FileContent = OpenAICompletionsIO.getFileContent(message[FILES]);
      if (message[TEXT] && message[TEXT].trim().length > 0) content.unshift({[TYPE]: TEXT, [TEXT]: message[TEXT]});
      return content;
    }
    return message[TEXT];
  }

  private preprocessBody(body: OpenAIConverseBodyInternal, pMessages: MessageContentI[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body));
    const processedMessages = this.processMessages(pMessages).map((message) => ({
      content: OpenAICompletionsIO.getContent(message),
      role: DirectServiceIO.getRoleViaUser(message.role),
    }));
    this.addSystemMessage(processedMessages);
    bodyCopy.messages = processedMessages;
    return bodyCopy;
  }

  override async callServiceAPI(messages: Messages, pMessages: MessageContentI[]) {
    this.messages ??= messages;
    this.callDirectServiceServiceAPI(messages, pMessages, this.preprocessBody.bind(this), {});
  }

  override async extractResultData(result: OpenAICompletionsResult, prevBody?: OpenAIChat): Promise<ResponseI> {
    if (result[ERROR]) throw result[ERROR].message;
    if (result.choices?.[0]?.delta) {
      return this.extractStreamResult(result.choices[0], prevBody);
    }
    if (result.choices?.[0]?.message) {
      if (result.choices[0].message.tool_calls) {
        return this.handleToolsGeneric(result.choices[0].message, this.functionHandler, this.messages, prevBody);
      }
      if (result.choices[0].message?.[AUDIO]) {
        const tts = this.deepChat.textToSpeech;
        const displayText = typeof tts === 'object' && typeof tts?.[AUDIO]?.displayText === 'boolean';
        return {
          [FILES]: [{[SRC]: `data:audio/wav;base64,${result.choices[0].message[AUDIO].data}`, [TYPE]: AUDIO}],
          [TEXT]: displayText ? result.choices[0].message[AUDIO].transcript : undefined,
        };
      }
      return {[TEXT]: result.choices[0].message.content};
    }
    return {[TEXT]: ''};
  }

  private async extractStreamResult(choice: OpenAICompletionsResultChoice, prevBody?: OpenAIChat) {
    return this.extractStreamResultWToolsGeneric(this, choice, this.functionHandler, prevBody);
  }
}
