import {OpenAIAssistantData, OpenAIAssistantContent, OpenAIAssistantMessagesResult} from '../../../types/openAIResult';
import {MessageFileType, MessageFile} from '../../../types/messageFile';
import {Messages} from '../../../views/chat/messages/messages';
import {RequestUtils} from '../../../utils/HTTP/requestUtils';
import {DirectServiceIO} from '../../utils/directServiceIO';
import {OpenAIUtils} from './openAIUtils';
import {ServiceIO} from '../../serviceIO';

type FileDetails = {fileId: string; path?: string; name?: string}[];

export type UploadedFile = {id: string; name: string};

export class OpenAIAssistantUtils {
  // triggered ONLY for file_search and code_interceptor
  public static readonly FILES_WITH_TEXT_ERROR = 'content with type `text` must have `text` values';

  public static readonly FUNCTION_TOOL_RESP_ERROR =
    'Response must contain an array of strings for each individual function/tool_call, ' +
    'see https://deepchat.dev/docs/directConnection/OpenAI/#assistant-functions.';

  public static async storeFiles(serviceIO: ServiceIO, messages: Messages, files: File[]) {
    const headers = serviceIO.connectSettings.headers;
    if (!headers) return;
    serviceIO.url = 'https://api.openai.com/v1/files'; // stores files
    const previousContentType = headers[RequestUtils.CONTENT_TYPE];
    delete headers[RequestUtils.CONTENT_TYPE];
    const requests = files.map(async (file) => {
      const formData = new FormData();
      formData.append('purpose', 'assistants');
      formData.append('file', file);
      return new Promise<{id: string; filename: string}>((resolve) => {
        resolve(OpenAIUtils.directFetch(serviceIO, formData, 'POST', false)); // should perhaps use await but works without
      });
    });
    try {
      const uploadedFiles = (await Promise.all(requests)).map((result) => {
        return {id: result.id, name: result.filename};
      });
      headers[RequestUtils.CONTENT_TYPE] = previousContentType;
      return uploadedFiles as UploadedFile[];
    } catch (err) {
      headers[RequestUtils.CONTENT_TYPE] = previousContentType;
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
            type: OpenAIAssistantUtils.getType(fileDetails, index),
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

  // prettier-ignore
  private static async getFilesAndNewText(io: ServiceIO, fileDetails: FileDetails,
      role?: string, content?: OpenAIAssistantContent) {
    let files: MessageFile[] | undefined;
    if (fileDetails.length > 0) {
      files = await OpenAIAssistantUtils.getFiles(io, fileDetails);
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
    // not displaying a separate file if annotated
    return content?.text?.value ? {text: content.text.value, role} : {files, role};
  }

  // Noticed an issue where text contains a sandbox hyperlink to a csv, but no annotation provided
  // To reproduce use the following text:
  // give example data for a csv and create a suitable bar chart for it with a link
  // Don't think it can be fixed and it is something on OpenAI side of things
  // prettier-ignore
  private static getFileDetails(lastMessage: OpenAIAssistantData, content?: OpenAIAssistantContent) {
    const fileDetails: FileDetails = [];
    if (content?.text?.value) {
      lastMessage.content.forEach((content) => {
        content.text?.annotations?.forEach((annotation) => {
          if (annotation.text && annotation.text.startsWith('sandbox:') && annotation.file_path?.file_id) {
            fileDetails.push({
              path: annotation.text,
              fileId: annotation.file_path.file_id,
              name: OpenAIAssistantUtils.getFileName(annotation.text),
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

  public static async getFilesAndText(io: ServiceIO, message: OpenAIAssistantData, content?: OpenAIAssistantContent) {
    const fileDetails = OpenAIAssistantUtils.getFileDetails(message, content);
    // gets files and replaces hyperlinks with base64 file encodings
    return await OpenAIAssistantUtils.getFilesAndNewText(io, fileDetails, message.role, content);
  }

  private static parseResult(result: OpenAIAssistantMessagesResult, isHistory: boolean) {
    let messages = [];
    if (isHistory) {
      messages = result.data;
    } else {
      for (let i = 0; i < result.data.length; i += 1) {
        const message = result.data[i];
        if (message.role === 'assistant') {
          messages.push(message);
        } else {
          break;
        }
      }
    }
    return messages.reverse();
  }

  // test this using this prompt and it should give 2 text mesages and a file:
  // "give example data for a csv and create a suitable bar chart"
  private static parseMessages(io: DirectServiceIO, messages: OpenAIAssistantData[]) {
    const parsedContent: Promise<{text?: string; files?: MessageFile[]}>[] = [];
    messages.forEach(async (data) => {
      data.content
        .filter((content) => !!content.text || !!content.image_file)
        .sort((content) => {
          if (content.text) return -1;
          if (content.image_file) return 1;
          return 0;
        })
        .forEach(async (content) => {
          parsedContent.push(OpenAIAssistantUtils.getFilesAndText(io, data, content));
        });
    });
    return Promise.all(parsedContent);
  }

  public static async processStreamMessages(io: DirectServiceIO, content: OpenAIAssistantContent[]) {
    return OpenAIAssistantUtils.parseMessages(io, [{content, role: 'assistant'}]);
  }

  public static async processAPIMessages(io: DirectServiceIO, result: OpenAIAssistantMessagesResult, isHistory: boolean) {
    const messages = OpenAIAssistantUtils.parseResult(result, isHistory);
    return OpenAIAssistantUtils.parseMessages(io, messages);
  }
}
