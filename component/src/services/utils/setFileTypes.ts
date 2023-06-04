import {RemarkableConfig} from '../../views/chat/messages/remarkable/remarkableConfig';
import {FileServiceIO, ServiceFileTypes, ServiceIO} from '../serviceIO';
import {FilesServiceConfig} from '../../types/fileServiceConfigs';
import {FileAttachments} from '../../types/fileAttachments';
import {RequestSettings} from '../../types/requestSettings';
import {AiAssistant} from '../../aiAssistant';

// WORK - watch the remarkable initializations
export class SetFileTypes {
  // prettier-ignore
  private static parseConfig(requestSettings: RequestSettings, defFiles: FileAttachments,
      fileType?: boolean | FilesServiceConfig) {
    const fileConfig: FileServiceIO & {files: FileAttachments} = {files: defFiles};
    if (typeof fileType === 'object') {
      const {files, request, button} = fileType;
      if (files) {
        if (files.infoModal) {
          fileConfig.files.infoModal = files.infoModal;
          if (files.infoModal?.textMarkDown) {
            const remarkable = RemarkableConfig.createNew();
            fileConfig.infoModalTextMarkUp = remarkable.render(files.infoModal.textMarkDown);
          }
        }
        if (files.acceptedFormats) fileConfig.files.acceptedFormats = files.acceptedFormats;
        if (files.maxNumberOfFiles) fileConfig.files.maxNumberOfFiles = files.maxNumberOfFiles;
      }
      fileConfig.button = button;
      fileConfig.request = {
        headers: request?.headers || requestSettings.headers,
        method: request?.method || requestSettings.method,
        url: request?.url || requestSettings.url,
      };
    }
    return fileConfig;
  }

  private static processMixedFiles(serviceIO: ServiceIO, mixedFiles: AiAssistant['mixedFiles']) {
    if (mixedFiles) {
      const defFormats = {acceptedFormats: ''};
      serviceIO.fileTypes.mixedFiles = SetFileTypes.parseConfig(serviceIO.requestSettings, defFormats, mixedFiles);
    }
  }

  // needs to be set after audio to overwrite maxNumberOfFiles
  // prettier-ignore
  private static processMicrophone(
    serviceIO: ServiceIO, microphone: AiAssistant['microphoneAudio'], audio: AiAssistant['audio']) {
  const files = serviceIO.fileTypes.audio?.files || {};
  const defaultFormats = {acceptedFormats: 'audio/*', ...files};
  if (!microphone) return;
  if (navigator.mediaDevices.getUserMedia !== undefined) {
    serviceIO.recordAudio = SetFileTypes.parseConfig(serviceIO.requestSettings, defaultFormats, microphone);
    // adding configuration that parseConfig does not add (don't want to overwrite as it may have processed properties)
    if (typeof microphone === 'object') {
      if (microphone.files) {
        serviceIO.recordAudio.files ??= {}; // for typescript
        serviceIO.recordAudio.files.format = microphone.files?.format;
        // this.recordAudio.files.newFilePrefix = customService.microphoneAudio.files?.newFilePrefix;
        serviceIO.recordAudio.files.maxDurationSeconds = microphone.files?.maxDurationSeconds;
        if (serviceIO.fileTypes.audio?.files) {
          serviceIO.fileTypes.audio.files.maxNumberOfFiles ??= microphone.files.maxNumberOfFiles;
        }
      }
    }
    // if microphone is not available - fallback to normal audio upload
  } else if (!audio) {
    serviceIO.fileTypes.audio = SetFileTypes.parseConfig(serviceIO.requestSettings, defaultFormats, microphone);
  }
}

  private static processAudioConfig(serviceIO: ServiceIO, audio: AiAssistant['audio'], fileIO?: FileServiceIO) {
    if (!audio && !fileIO) return;
    const files = fileIO?.files || {};
    const defaultFormats = {acceptedFormats: 'audio/*', ...files};
    // make sure to set these in the right services
    serviceIO.fileTypes.audio = SetFileTypes.parseConfig(serviceIO.requestSettings, defaultFormats, audio);
  }

  // needs to be set after images to overwrite maxNumberOfFiles
  private static processCamera(serviceIO: ServiceIO, camera: AiAssistant['camera'], images?: AiAssistant['images']) {
    const files = serviceIO.fileTypes.images?.files || {};
    const defaultFormats = {acceptedFormats: 'image/*', ...files};
    if (!camera) return;
    if (navigator.mediaDevices.getUserMedia !== undefined) {
      // check how maxNumberOfFiles is set here - if user has set in images - should use that instead
      serviceIO.camera = SetFileTypes.parseConfig(serviceIO.requestSettings, defaultFormats, camera);
      if (typeof camera === 'object') {
        serviceIO.camera.modalContainerStyle = camera.modalContainerStyle;
        // adding configuration that parseConfig does not add (don't want to overwrite as it may have processed properties)
        if (camera.files) {
          serviceIO.camera.files ??= {}; // for typescript
          serviceIO.camera.files.format = camera.files?.format;
          // this.camera.files.newFilePrefix = customService.camera.files?.newFilePrefix; // can implement in the future
          serviceIO.camera.files.dimensions = camera.files?.dimensions;
        }
      }
      // if camera is not available - fallback to normal image upload
    } else if (!images) {
      serviceIO.fileTypes.images = SetFileTypes.parseConfig(serviceIO.requestSettings, defaultFormats, camera);
    }
  }

  private static processImagesConfig(serviceIO: ServiceIO, images: AiAssistant['images'], fileIO?: FileServiceIO) {
    if (!images && !fileIO) return;
    const files = fileIO?.files || {};
    const defaultFormats = {acceptedFormats: 'image/*', ...files};
    // make sure to set these in the right services
    serviceIO.fileTypes.images = SetFileTypes.parseConfig(serviceIO.requestSettings, defaultFormats, images);
  }

  public static set(aiAssistant: AiAssistant, serviceIO: ServiceIO, defaultFileTypes?: ServiceFileTypes) {
    SetFileTypes.processImagesConfig(serviceIO, aiAssistant.images, defaultFileTypes?.images);
    SetFileTypes.processCamera(serviceIO, aiAssistant.camera, aiAssistant.images);
    SetFileTypes.processAudioConfig(serviceIO, aiAssistant.audio, defaultFileTypes?.audio);
    SetFileTypes.processMicrophone(serviceIO, aiAssistant.microphoneAudio, aiAssistant.audio);
    SetFileTypes.processMixedFiles(serviceIO, aiAssistant.mixedFiles);
  }
}
