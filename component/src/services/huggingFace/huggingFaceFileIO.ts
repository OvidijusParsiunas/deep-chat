import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {HuggingFaceModel} from '../../types/huggingFace';
import {ServiceFileTypes} from '../serviceIO';
import {HuggingFaceIO} from './huggingFaceIO';
import {APIKey} from '../../types/APIKey';
import {DeepChat} from '../../deepChat';

// can sometimes get a (Service Unavailable) error which can be ignored when polling as another request will be made
export class HuggingFaceFileIO extends HuggingFaceIO {
  isTextInputDisabled = true;

  // prettier-ignore
  constructor(deepChat: DeepChat, placeholderText: string, defaultModel: string,
      config: true | (HuggingFaceModel), apiKey?: APIKey, existingFileTypes?: ServiceFileTypes) {
    super(deepChat, placeholderText, defaultModel, config, apiKey, existingFileTypes);
    this.canSendMessage = HuggingFaceFileIO.canSendFile;
  }

  private static canSendFile(_?: string, files?: File[]) {
    return !!files?.[0];
  }

  override preprocessBody(_: {}, __: MessageContentI[], files: File[]) {
    return files[0] as unknown as {inputs: string};
  }

  // prettier-ignore
  override async callServiceAPI(messages: Messages, _: MessageContentI[], files?: File[]) {
    if (!this.connectSettings) throw new Error('Request settings have not been set up');
    if (!files?.[0]) throw new Error('No file was added');
    HTTPRequest.poll(this, files[0], messages, false);
  }
}
