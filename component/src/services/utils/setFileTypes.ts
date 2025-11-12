import {AUDIO, CAMERA, FILES, GIFS, IMAGES, MICROPHONE, MIXED_FILES} from '../../utils/consts/messageConstants';
import {RemarkableConfig} from '../../views/chat/messages/remarkable/remarkableConfig';
import {FileServiceIO, ServiceFileTypes, ServiceIO} from '../serviceIO';
import {FilesServiceConfig} from '../../types/fileServiceConfigs';
import {FileAttachments} from '../../types/fileAttachments';
import {Legacy} from '../../utils/legacy/legacy';
import {DeepChat} from '../../deepChat';
import {Remarkable} from 'remarkable';

export class SetFileTypes {
  private static parseConfig(defFiles: FileAttachments, remark: Remarkable, fileType?: boolean | FilesServiceConfig) {
    const fileConfig: FileServiceIO & {files: FileAttachments} = {files: defFiles};
    if (typeof fileType === 'object') {
      Legacy.processFileConfigConnect(fileType);
      const {files, connect, button} = fileType;
      if (files) {
        if (files.infoModal) {
          fileConfig[FILES].infoModal = files.infoModal;
          if (files.infoModal?.textMarkDown) {
            fileConfig.infoModalTextMarkUp = remark.render(files.infoModal.textMarkDown);
          }
        }
        if (files.acceptedFormats) fileConfig[FILES].acceptedFormats = files.acceptedFormats;
        if (files.maxNumberOfFiles) fileConfig[FILES].maxNumberOfFiles = files.maxNumberOfFiles;
      }
      fileConfig.button = button;
      if (connect && Object.keys(connect).length > 0) fileConfig.connect = connect;
    }
    return fileConfig;
  }

  private static processMixedFiles(serviceIO: ServiceIO, remark: Remarkable, mixedFiles: DeepChat['mixedFiles']) {
    if (mixedFiles) {
      const defFormats = {acceptedFormats: ''};
      serviceIO.fileTypes.mixedFiles = SetFileTypes.parseConfig(defFormats, remark, mixedFiles);
    }
  }

  // needs to be set after audio to overwrite maxNumberOfFiles
  // prettier-ignore
  private static processMicrophone(
      serviceIO: ServiceIO, remark: Remarkable, microphone: DeepChat['microphone'], audio: DeepChat['audio']) {
    const files = serviceIO.fileTypes[AUDIO]?.[FILES] || {};
    const defaultFormats = {acceptedFormats: 'audio/*', ...files};
    if (!microphone) return;
    if (navigator.mediaDevices.getUserMedia !== undefined) {
      serviceIO.recordAudio = SetFileTypes.parseConfig(defaultFormats, remark, microphone);
      // adding configuration that parseConfig does not add (don't want to overwrite as it may have processed properties)
      if (typeof microphone === 'object') {
        if (microphone[FILES]) {
          serviceIO.recordAudio[FILES] ??= {}; // for typescript
          serviceIO.recordAudio[FILES].format = microphone[FILES]?.format;
          // this.recordAudio[FILES].newFilePrefix = customService[MICROPHONE][FILES]?.newFilePrefix;
          serviceIO.recordAudio[FILES].maxDurationSeconds = microphone[FILES]?.maxDurationSeconds;
          if (serviceIO.fileTypes[AUDIO]?.[FILES]) {
            serviceIO.fileTypes[AUDIO][FILES].maxNumberOfFiles ??= microphone[FILES].maxNumberOfFiles;
          }
        }
      }
      // if microphone is not available - fallback to normal audio upload
    } else if (!audio) {
      serviceIO.fileTypes[AUDIO] = SetFileTypes.parseConfig(defaultFormats, remark, microphone);
    }
  }

  // prettier-ignore
  private static processAudioConfig(
      serviceIO: ServiceIO, remark: Remarkable, audio: DeepChat['audio'], fileIO?: FileServiceIO) {
    if (!audio && !fileIO) return;
    const files = fileIO?.[FILES] || {};
    const defaultFormats = {acceptedFormats: 'audio/*', ...files};
    // make sure to set these in the right services
    serviceIO.fileTypes[AUDIO] = SetFileTypes.parseConfig(defaultFormats, remark, audio);
  }

  // prettier-ignore
  private static processGifConfig(
      serviceIO: ServiceIO, remark: Remarkable, gifs: DeepChat['gifs'], fileIO?: FileServiceIO) {
    if (!gifs && !fileIO) return;
    const files = fileIO?.[FILES] || {};
    const defaultFormats = {acceptedFormats: 'image/gif', ...files};
    // make sure to set these in the right services
    serviceIO.fileTypes[GIFS] = SetFileTypes.parseConfig(defaultFormats, remark, gifs);
  }

  // needs to be set after images to overwrite maxNumberOfFiles
  // prettier-ignore
  private static processCamera(
      serviceIO: ServiceIO, remark: Remarkable, camera: DeepChat['camera'], images?: DeepChat['images']) {
    const files = serviceIO.fileTypes[IMAGES]?.[FILES] || {};
    const defaultFormats = {acceptedFormats: 'image/*', ...files};
    if (!camera) return;
    if (navigator.mediaDevices.getUserMedia !== undefined) {
      // check how maxNumberOfFiles is set here - if user has set in images - should use that instead
      serviceIO[CAMERA] = SetFileTypes.parseConfig(defaultFormats, remark, camera);
      if (typeof camera === 'object') {
        serviceIO[CAMERA].modalContainerStyle = camera.modalContainerStyle;
        // adding configuration that parseConfig does not add (don't want to overwrite as it may have processed properties)
        if (camera[FILES]) {
          serviceIO[CAMERA][FILES] ??= {}; // for typescript
          serviceIO[CAMERA][FILES].format = camera[FILES]?.format;
          serviceIO[CAMERA][FILES].dimensions = camera[FILES]?.dimensions;
        }
      }
      // if camera is not available - fallback to normal image upload
    } else if (!images) {
      serviceIO.fileTypes[IMAGES] = SetFileTypes.parseConfig(defaultFormats, remark, camera);
    }
  }

  // prettier-ignore
  private static processImagesConfig(
      serviceIO: ServiceIO, remark: Remarkable, images: DeepChat['images'], fileIO?: FileServiceIO) {
    if (!images && !fileIO) return;
    const files = fileIO?.[FILES] || {};
    const defaultFormats = {acceptedFormats: 'image/*', ...files};
    // make sure to set these in the right services
    serviceIO.fileTypes[IMAGES] = SetFileTypes.parseConfig(defaultFormats, remark, images);
  }

  // default for direct service
  private static populateDefaultFileIO(fileIO: FileServiceIO | undefined, acceptedFormats: string) {
    if (fileIO) {
      fileIO[FILES] ??= {};
      fileIO[FILES].acceptedFormats ??= acceptedFormats;
      fileIO[FILES].maxNumberOfFiles ??= 1;
    }
  }

  public static set(deepChat: DeepChat, serviceIO: ServiceIO, existingFileTypes?: ServiceFileTypes) {
    SetFileTypes.populateDefaultFileIO(existingFileTypes?.[AUDIO], '.4a,.mp3,.webm,.mp4,.mpga,.wav,.mpeg,.m4a');
    SetFileTypes.populateDefaultFileIO(existingFileTypes?.[IMAGES], '.png,.jpg');
    const remarkable = RemarkableConfig.createNew(deepChat.remarkable);
    SetFileTypes.processImagesConfig(serviceIO, remarkable, deepChat[IMAGES], existingFileTypes?.[IMAGES]);
    SetFileTypes.processCamera(serviceIO, remarkable, deepChat[CAMERA], deepChat[IMAGES]);
    SetFileTypes.processGifConfig(serviceIO, remarkable, deepChat[GIFS], existingFileTypes?.[GIFS]);
    SetFileTypes.processAudioConfig(serviceIO, remarkable, deepChat[AUDIO], existingFileTypes?.[AUDIO]);
    SetFileTypes.processMicrophone(serviceIO, remarkable, deepChat[MICROPHONE], deepChat[AUDIO]);
    SetFileTypes.processMixedFiles(serviceIO, remarkable, deepChat[MIXED_FILES]);
  }
}
