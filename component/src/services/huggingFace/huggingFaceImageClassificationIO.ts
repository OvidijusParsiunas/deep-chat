import {CompletionsHandlers, FileServiceIO, PollResult, ServiceFileTypes, StreamHandlers} from '../serviceIO';
import {RemarkableConfig} from '../../views/chat/messages/remarkable/remarkableConfig';
import {ValidateMessageBeforeSending} from '../../types/validateMessageBeforeSending';
import {HuggingFaceClassificationResult} from '../../types/huggingFaceResult';
import {CameraFilesServiceConfig} from '../../types/fileServiceConfigs';
import {ExistingServiceCameraConfig} from '../../types/camera';
import {FileAttachments} from '../../types/fileAttachments';
import {Messages} from '../../views/chat/messages/messages';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {HuggingFace} from '../../types/huggingFace';
import {MessageContent} from '../../types/messages';
import {CameraFiles} from '../../types/cameraFiles';
import {GenericButton} from '../../types/button';
import {HuggingFaceIO} from './huggingFaceIO';
import {AiAssistant} from '../../aiAssistant';
import {Remarkable} from 'remarkable';

export class HuggingFaceImageClassificationIO extends HuggingFaceIO {
  override canSendMessage: ValidateMessageBeforeSending = HuggingFaceImageClassificationIO.canSendFile;
  isTextInputDisabled = true;
  fileTypes: ServiceFileTypes = {images: {files: {acceptedFormats: '.png,.jpg', maxNumberOfFiles: 1}}};
  camera?: CameraFilesServiceConfig;

  constructor(aiAssistant: AiAssistant, key?: string) {
    const config = aiAssistant.service?.huggingFace?.imageClassification as NonNullable<
      HuggingFace['imageClassification']
    >;
    super(aiAssistant, 'Attach an image file', 'google/vit-base-patch16-224', config, key);
    if (config && typeof config !== 'boolean' && this.fileTypes.images) {
      const remarkable = RemarkableConfig.createNew();
      HuggingFaceImageClassificationIO.processImagesConfig(this.fileTypes.images, remarkable, config.files, config.button);
      if (config.camera) this.camera = HuggingFaceImageClassificationIO.processCameraConfig(config.camera);
    }
  }

  // prettier-ignore
  private static processImagesConfig(_images: FileServiceIO, remarkable: Remarkable, files?: FileAttachments,
      button?: GenericButton) {
    if (files && _images.files) {
      if (_images.files.infoModal) {
        Object.assign(_images.files.infoModal, files.infoModal);
        const markdown = files.infoModal?.textMarkDown;
        _images.infoModalTextMarkUp = remarkable.render(markdown || '');
      }
      if (files.acceptedFormats) _images.files.acceptedFormats = files.acceptedFormats;
      if (files.maxNumberOfFiles) _images.files.maxNumberOfFiles = files.maxNumberOfFiles;
    }
    _images.button = button;
  }

  private static processCameraConfig(camera: ExistingServiceCameraConfig['camera']) {
    const cameraConfig: CameraFilesServiceConfig & {files: CameraFiles} = {files: {}};
    if (typeof camera === 'object') {
      cameraConfig.button = camera.button;
      cameraConfig.modalContainerStyle = camera.modalContainerStyle;
      // cameraConfig.files.newFilePrefix = camera.newFilePrefix; // can implement in the future
    }
    return cameraConfig;
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

  async extractPollResultData(result: HuggingFaceClassificationResult): PollResult {
    if (result.estimated_time) return {timeoutMS: (result.estimated_time + 1) * 1000};
    if (result.error) throw result.error;
    return {text: result[0]?.label || ''};
  }
}
