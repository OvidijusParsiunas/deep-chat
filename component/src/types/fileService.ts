import {ServiceRequestConfig} from './requestSettings';
import {FileAttachments} from './fileAttachments';
import {GenericButton} from './button';

export type FilesServiceConfig<Files = FileAttachments> = ServiceRequestConfig & {files?: Files; button?: GenericButton};
