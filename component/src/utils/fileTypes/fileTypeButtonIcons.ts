import {UPLOAD_IMAGES_ICON_STRING} from '../../icons/uploadImagesIcon';
import {ANY_FILES_ICON_STRING} from '../../icons/anyFilesIcon';
import {AUDIO_ICON_STRING} from '../../icons/audioIcon';
import {FILE_TYPES} from '../../types/fileTypes';

type ServiceFileTypes = {
  [key in FILE_TYPES]: {
    id: string;
    svgString: string;
  };
};

export const FILE_TYPE_BUTTON_ICONS: ServiceFileTypes = {
  images: {id: 'upload-images-icon', svgString: UPLOAD_IMAGES_ICON_STRING},
  audio: {id: 'upload-audio-icon', svgString: AUDIO_ICON_STRING},
  anyFiles: {id: 'upload-any-files-icon', svgString: ANY_FILES_ICON_STRING},
};
