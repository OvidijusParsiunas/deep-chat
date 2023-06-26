import {MIXED_FILES_ICON_STRING} from '../../icons/mixedFilesIcon';
import {IMAGE_ICON_STRING} from '../../icons/imageIcon';
import {AUDIO_ICON_STRING} from '../../icons/audioIcon';
import {GIF_ICON_STRING} from '../../icons/gifIcon';
import {FILE_TYPES} from '../../types/fileTypes';

type ServiceFileTypes = {
  [key in FILE_TYPES]: {
    id: string;
    svgString: string;
    dropupText: string;
  };
};

export const FILE_TYPE_BUTTON_ICONS: ServiceFileTypes = {
  images: {id: 'upload-images-icon', svgString: IMAGE_ICON_STRING, dropupText: 'Image'},
  gifs: {id: 'upload-gifs-icon', svgString: GIF_ICON_STRING, dropupText: 'GIF'},
  audio: {id: 'upload-audio-icon', svgString: AUDIO_ICON_STRING, dropupText: 'Audio'},
  mixedFiles: {id: 'upload-mixed-files-icon', svgString: MIXED_FILES_ICON_STRING, dropupText: 'File'},
};
