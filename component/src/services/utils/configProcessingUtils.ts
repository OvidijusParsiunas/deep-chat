import {CameraFilesServiceConfig, RecordAudioFilesServiceConfig} from '../../types/fileServiceConfigs';
import {ExistingServiceAudioRecordingConfig} from '../../types/microphone';
import {AudioRecordingFiles} from '../../types/audioRecordingFiles';
import {ExistingServiceCameraConfig} from '../../types/camera';
import {FileAttachments} from '../../types/fileAttachments';
import {CameraFiles} from '../../types/cameraFiles';
import {GenericButton} from '../../types/button';
import {FileServiceIO} from '../serviceIO';
import {Remarkable} from 'remarkable';

type AudioConfig = RecordAudioFilesServiceConfig & {files: AudioRecordingFiles};

export class ConfigProcessingUtils {
  // prettier-ignore
  public static processImagesConfig(images: FileServiceIO, remarkable: Remarkable, files?: FileAttachments,
      button?: GenericButton) {
    if (files && images.files) {
      if (images.files.infoModal) {
        Object.assign(images.files.infoModal, files.infoModal);
        const markdown = files.infoModal?.textMarkDown;
        images.infoModalTextMarkUp = remarkable.render(markdown || '');
      }
      if (files.acceptedFormats) images.files.acceptedFormats = files.acceptedFormats;
      if (files.maxNumberOfFiles) images.files.maxNumberOfFiles = files.maxNumberOfFiles;
    }
    images.button = button;
  }

  public static processCameraConfig(camera: ExistingServiceCameraConfig['camera']) {
    const cameraConfig: CameraFilesServiceConfig & {files: CameraFiles} = {files: {}};
    if (typeof camera === 'object') {
      cameraConfig.button = camera.button;
      cameraConfig.modalContainerStyle = camera.modalContainerStyle;
      // cameraConfig.files.newFilePrefix = camera.newFilePrefix; // can implement in the future
    }
    return cameraConfig;
  }

  // prettier-ignore
  public static processAudioConfig(audio: FileServiceIO, remarkable: Remarkable,
      files?: FileAttachments, button?: GenericButton) {
    if (files && audio.files) {
      if (audio.files.infoModal) {
        Object.assign(audio.files.infoModal, files.infoModal);
        const markdown = files.infoModal?.textMarkDown;
        audio.infoModalTextMarkUp = remarkable.render(markdown || '');
      }
      if (files.acceptedFormats) audio.files.acceptedFormats = files.acceptedFormats;
      if (files.maxNumberOfFiles) audio.files.maxNumberOfFiles = files.maxNumberOfFiles;
    }
    audio.button = button;
  }

  // prettier-ignore
  public static processRecordAudioConfig(microphone: ExistingServiceAudioRecordingConfig['microphone'],
      config?: AudioConfig) {
    const recordAudioConfig: AudioConfig = config || {files: {format: 'mp3'}};
    if (typeof microphone === 'object') {
      recordAudioConfig.button = microphone.styles;
      if (microphone.format) recordAudioConfig.files.format = microphone.format;
      recordAudioConfig.files.maxDurationSeconds = microphone.maxDurationSeconds;
      // recordAudioConfig.files.newFilePrefix = microphone.newFilePrefix; // can implement in the future
    }
    return recordAudioConfig;
  }
}
