import {CompletionsHandlers, StreamHandlers} from '../serviceIO';
import {ServiceCallConfig} from '../../types/requestSettings';
import {Messages} from '../../views/chat/messages/messages';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {HuggingFaceModel} from '../../types/huggingFace';
import {MessageContent} from '../../types/messages';
import {FILE_TYPES} from '../../types/fileTypes';
import {HuggingFaceIO} from './huggingFaceIO';
import {AiAssistant} from '../../aiAssistant';

export class HuggingFaceFileIO extends HuggingFaceIO {
  isTextInputDisabled = true;

  // prettier-ignore
  constructor(aiAssistant: AiAssistant, placeholderText: string, defaultModel: string,
      config: true | (HuggingFaceModel & ServiceCallConfig), fileType: FILE_TYPES) {
    super(aiAssistant, placeholderText, defaultModel, config, fileType);
    this.canSendMessage = aiAssistant.validateMessageBeforeSending || HuggingFaceFileIO.canSendFile;
  }

  private static canSendFile(_: string, files?: File[]) {
    return !!files?.[0];
  }

  override preprocessBody(_: {}, __: MessageContent[], files: File[]) {
    return files[0] as unknown as {inputs: string};
  }

  override callApi(messages: Messages, completionsHandlers: CompletionsHandlers, _: StreamHandlers, files?: File[]) {
    if (!this.requestSettings) throw new Error('Request settings have not been set up');
    if (!files?.[0]) throw new Error('No file was added');
    HTTPRequest.poll(this, files[0], messages, completionsHandlers.onFinish, false);
  }
}
