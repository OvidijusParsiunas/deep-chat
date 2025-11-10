import {OPEN_AI_BUILD_HEADERS, OPEN_AI_BUILD_KEY_VERIFICATION_DETAILS} from './utils/openAIUtils';
import {INCORRECT_ERROR_PREFIX, INPUT_AUDIO, OBJECT} from '../utils/serviceConstants';
import {AUDIO, FILES, SRC, TEXT, TYPE} from '../../utils/consts/messageConstants';
import {KeyVerificationDetails} from '../../types/keyVerificationDetails';
import {DirectConnection} from '../../types/directConnection';
import {MessageContentI} from '../../types/messagesInternal';
import {DirectServiceIO} from '../utils/directServiceIO';
import {BuildHeadersFunc} from '../../types/headers';
import {MessageFile} from '../../types/messageFile';
import {OpenAIChat} from '../../types/openAI';
import {APIKey} from '../../types/APIKey';
import {DeepChat} from '../../deepChat';

export abstract class OpenAIBaseIO extends DirectServiceIO {
  override insertKeyPlaceholderText = this.genereteAPIKeyName('OpenAI');
  override keyHelpUrl = 'https://platform.openai.com/account/api-keys';
  permittedErrorPrefixes = [INCORRECT_ERROR_PREFIX, 'Invalid value'];

  // prettier-ignore
  constructor(deepChat: DeepChat, keyVerificationDetailsArg?: KeyVerificationDetails,
      buildHeadersFuncArg?: BuildHeadersFunc, apiKeyArg?: APIKey, configArg?: true | OpenAIChat) {
    const directConnectionCopy = JSON.parse(JSON.stringify(deepChat.directConnection)) as DirectConnection;
    const keyVerificationDetails = keyVerificationDetailsArg || OPEN_AI_BUILD_KEY_VERIFICATION_DETAILS();
    const buildHeadersFunc = buildHeadersFuncArg || OPEN_AI_BUILD_HEADERS;
    const apiKey = apiKeyArg || directConnectionCopy.openAI;
    super(deepChat, keyVerificationDetails, buildHeadersFunc, apiKey);

    const config = (configArg || directConnectionCopy.openAI?.chat) as OpenAIChat;
    if (typeof config === OBJECT) {
      this.processConfig(config, deepChat);
    }
    this.maxMessages ??= -1;
    this.rawBody.model ??= 'gpt-4o';
  }

  protected processConfig(config: OpenAIChat, deepChat: DeepChat) {
    this.completeConfig(config, (deepChat.directConnection?.openAI?.chat as OpenAIChat)?.function_handler);
  }

  protected static getBaseFileContent(files: MessageFile[]) {
    return files.map((file) => {
      if (file.type === AUDIO) {
        const base64Data = file[SRC]?.split(',')[1];
        const format = file.name?.split('.').pop()?.toLowerCase() || 'wav';
        return {[TYPE]: INPUT_AUDIO, [INPUT_AUDIO]: {data: base64Data, format}};
      }
      return file;
    });
  }

  protected static getBaseContent(message: MessageContentI, includeFilesForRole: boolean = true) {
    const shouldIncludeFiles = includeFilesForRole && message[FILES] && message[FILES].length > 0;
    if (shouldIncludeFiles) {
      const content: object[] = this.getBaseFileContent(message[FILES]!);
      if (message[TEXT] && message[TEXT].trim().length > 0) {
        content.unshift({[TYPE]: TEXT, [TEXT]: message[TEXT]});
      }
      return content;
    }
    return message[TEXT];
  }
}
