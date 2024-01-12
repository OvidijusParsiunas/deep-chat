import {OpenAIAssistantData, OpenAIAssistantContent} from '../../../types/openAIResult';
import {MessageFileType, MessageFile} from '../../../types/messageFile';
import {OpenAIUtils} from './openAIUtils';
import {ServiceIO} from '../../serviceIO';

type FileDetails = {path: string; fileId: string; name: string}[];

export class OpenAIAssistantFiles {
  private static getType(fileDetails: FileDetails, index: number): MessageFileType {
    const {path} = fileDetails[index];
    if (path.endsWith('png')) return 'image';
    return 'any';
  }

  private static async getFiles(serviceIO: ServiceIO, paths: {path: string; fileId: string; name: string}[]) {
    const fileRequests = paths.map(({fileId}) => {
      // https://platform.openai.com/docs/api-reference/files/retrieve-contents
      serviceIO.url = `https://api.openai.com/v1/files/${fileId}/content`;
      return new Promise<Blob>((resolve) => {
        resolve(OpenAIUtils.directFetch(serviceIO, undefined, 'GET', false));
      });
    });
    const blobs = await Promise.all(fileRequests);
    const imageReaders = blobs.map((blob, index) => {
      return new Promise<MessageFile>((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onload = (event) => {
          resolve({
            src: (event.target as FileReader).result as string,
            name: paths[index].name,
            type: OpenAIAssistantFiles.getType(paths, index),
          });
        };
      });
    });
    return await Promise.all(imageReaders);
  }

  private static getFileName(path: string) {
    const parts = path.split('/');
    return parts[parts.length - 1];
  }

  public static getFileDetails(lastMessage: OpenAIAssistantData, content?: OpenAIAssistantContent) {
    const fileDetails: {path: string; fileId: string; name: string}[] = [];
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
    return fileDetails;
  }

  public static async getFilesAndNewText(sIO: ServiceIO, fileDetails: FileDetails, content?: OpenAIAssistantContent) {
    let files: MessageFile[] | undefined;
    if (fileDetails.length > 0) {
      files = await OpenAIAssistantFiles.getFiles(sIO, fileDetails);
      if (content?.text?.value) {
        files.forEach((file, index) => {
          if (!file.src) return;
          if (content?.text?.value) {
            content.text.value = content.text.value.replace(fileDetails[index].path, file.src);
          }
        });
      }
    }
    return {files, text: content?.text?.value};
  }
}
