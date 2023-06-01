import {CameraFilesServiceConfig, MicrophoneFilesServiceConfig} from '../../types/fileServiceConfigs';
import {AudioRecordingFiles, AudioWithMicrophoneConfig} from '../../types/microphone';
import {CameraFiles, ImagesWithCameraConfig} from '../../types/camera';
import {FileAttachments} from '../../types/fileAttachments';
import {FileServiceIO} from '../serviceIO';
import {Button} from '../../types/button';
import {Remarkable} from 'remarkable';

type AudioConfig = MicrophoneFilesServiceConfig & {files: AudioRecordingFiles};

export class ConfigProcessingUtils {
  public static processImagesConfig(images: FileServiceIO, remark: Remarkable, files?: FileAttachments, button?: Button) {
    if (files && images.files) {
      if (images.files.infoModal) {
        Object.assign(images.files.infoModal, files.infoModal);
        const markdown = files.infoModal?.textMarkDown;
        images.infoModalTextMarkUp = remark.render(markdown || '');
      }
      if (files.acceptedFormats) images.files.acceptedFormats = files.acceptedFormats;
      if (files.maxNumberOfFiles) images.files.maxNumberOfFiles = files.maxNumberOfFiles;
    }
    images.button = button;
  }

  public static processCameraConfig(camera: ImagesWithCameraConfig['camera']) {
    const cameraConfig: CameraFilesServiceConfig & {files: CameraFiles} = {files: {}};
    if (typeof camera === 'object') {
      cameraConfig.button = camera.button;
      cameraConfig.modalContainerStyle = camera.modalContainerStyle;
      if (camera.format) cameraConfig.files.format = camera.format;
      // cameraConfig.files.newFilePrefix = camera.newFilePrefix; // can implement in the future
    }
    return cameraConfig;
  }

  public static processAudioConfig(audio: FileServiceIO, remark: Remarkable, files?: FileAttachments, button?: Button) {
    if (files && audio.files) {
      if (audio.files.infoModal) {
        Object.assign(audio.files.infoModal, files.infoModal);
        const markdown = files.infoModal?.textMarkDown;
        audio.infoModalTextMarkUp = remark.render(markdown || '');
      }
      if (files.acceptedFormats) audio.files.acceptedFormats = files.acceptedFormats;
      if (files.maxNumberOfFiles) audio.files.maxNumberOfFiles = files.maxNumberOfFiles;
    }
    audio.button = button;
  }

  // prettier-ignore
  public static processRecordAudioConfig(microphone: AudioWithMicrophoneConfig['microphone'],
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
