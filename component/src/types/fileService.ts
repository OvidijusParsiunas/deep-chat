import {ServiceRequestConfig} from './requestSettings';
import {FileAttachments} from './fileAttachments';
import {GenericButton} from './button';

export type FilesServiceConfig = ServiceRequestConfig & {files?: FileAttachments; button?: GenericButton};
