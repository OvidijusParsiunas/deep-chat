import {OpenAIAssistantData, OpenAIAssistantContent} from '../../../types/openAIResult';
import {MessageFileType, MessageFile} from '../../../types/messageFile';
import {Messages} from '../../../views/chat/messages/messages';
import {RequestUtils} from '../../../utils/HTTP/requestUtils';
import {OpenAIUtils} from './openAIUtils';
import {ServiceIO} from '../../serviceIO';

type FileDetails = {fileId: string; path?: string; name?: string}[];

export class OpenAIAssistantFiles {
  public static async storeFiles(serviceIO: ServiceIO, messages: Messages, files: File[]) {
    const headers = serviceIO.requestSettings.headers;
    if (!headers) return;
    serviceIO.url = `https://api.openai.com/v1/files`; // stores files
    const previousContetType = headers[RequestUtils.CONTENT_TYPE];
    delete headers[RequestUtils.CONTENT_TYPE];
    const requests = files.map(async (file) => {
      const formData = new FormData();
      formData.append('purpose', 'assistants');
      formData.append('file', file);
      return new Promise<{id: string}>((resolve) => {
        resolve(OpenAIUtils.directFetch(serviceIO, formData, 'POST', false)); // should perhaps use await but works without
      });
    });
    try {
      const fileIds = (await Promise.all(requests)).map((result) => result.id);
      headers[RequestUtils.CONTENT_TYPE] = previousContetType;
      return fileIds;
    } catch (err) {
      headers[RequestUtils.CONTENT_TYPE] = previousContetType;
      // error handled here as files not sent using HTTPRequest.request to not trigger the interceptors
      RequestUtils.displayError(messages, err as object);
      serviceIO.completionsHandlers.onFinish();
      throw err;
    }
  }

  private static getType(fileDetails: FileDetails, index: number): MessageFileType {
    const {path} = fileDetails[index];
    // images don't have a path
    if (!path || path.endsWith('png')) return 'image';
    return 'any';
  }

  private static async getFiles(serviceIO: ServiceIO, fileDetails: FileDetails) {
    const fileRequests = fileDetails.map(({fileId}) => {
      // https://platform.openai.com/docs/api-reference/files/retrieve-contents
      serviceIO.url = `https://api.openai.com/v1/files/${fileId}/content`;
      return new Promise<Blob>((resolve) => {
        resolve(OpenAIUtils.directFetch(serviceIO, undefined, 'GET', false));
      });
    });
    const blobs = await Promise.all(fileRequests);
    const fileReaders = blobs.map((blob, index) => {
      return new Promise<MessageFile>((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onload = (event) => {
          resolve({
            src: (event.target as FileReader).result as string,
            name: fileDetails[index].name,
            type: OpenAIAssistantFiles.getType(fileDetails, index),
          });
        };
      });
    });
    return await Promise.all(fileReaders);
  }

  private static getFileName(path: string) {
    const parts = path.split('/');
    return parts[parts.length - 1];
  }

  private static getFileDetails(lastMessage: OpenAIAssistantData, content?: OpenAIAssistantContent) {
    const fileDetails: FileDetails = [];
    if (content?.text?.value) {
      lastMessage.content.forEach((content) => {
        content.text?.annotations?.forEach((annotation) => {
          if (annotation.text && annotation.text.startsWith('sandbox:') && annotation.file_path?.file_id) {
            fileDetails.push({
              path: annotation.text,
              fileId: annotation.file_path.file_id,
              name: OpenAIAssistantFiles.getFileName(annotation.text),
            });
          }
        });
      });
    }
    if (content?.image_file) {
      fileDetails.push({
        fileId: content.image_file.file_id,
      });
    }
    return fileDetails;
  }

  private static async getFilesAndNewText(io: ServiceIO, fileDetails: FileDetails, content?: OpenAIAssistantContent) {
    let files: MessageFile[] | undefined;
    if (fileDetails.length > 0) {
      files = await OpenAIAssistantFiles.getFiles(io, fileDetails);
      if (content?.text?.value) {
        files.forEach((file, index) => {
          if (!file.src) return;
          const path = fileDetails[index].path;
          if (content?.text?.value && path) {
            content.text.value = content.text.value.replace(path, file.src);
          }
        });
      }
    }
    return {files, text: content?.text?.value};
  }

  public static async getFilesAndText(io: ServiceIO, lastMessage: OpenAIAssistantData, content?: OpenAIAssistantContent) {
    const fileDetails = OpenAIAssistantFiles.getFileDetails(lastMessage, content);
    // gets files and replaces hyperlinks with base64 file encodings
    return await OpenAIAssistantFiles.getFilesAndNewText(io, fileDetails, content);
  }
}
